'use strict'

const path = require('path')
const fs = require('fs')
const { downloadMediaMessage } = require('@whiskeysockets/baileys')
const {
  imageToStickerBuffer,
  videoToStickerBuffer,
  sendSticker
} = require('../../utils/stickerUtils')

const ROOT = path.join(__dirname, '..', '..', '..')

function loadPackMeta() {
  for (const fp of [
    path.join(ROOT, 'config', 'config.json'),
    path.join(ROOT, 'database', 'config.json')
  ]) {
    try {
      if (fs.existsSync(fp)) {
        const c = JSON.parse(fs.readFileSync(fp, 'utf8'))
        return {
          packname: c.packname || c.NomeDoBot || 'Nyx Stickers',
          author: c.author || c.NomeDoDono || 'Nyx Bot'
        }
      }
    } catch {}
  }
  return { packname: 'Nyx Stickers', author: 'Nyx Bot' }
}

function resolveMedia(info) {
  const msg = info.message || {}

  if (msg.imageMessage) return { type: 'image', message: msg, isQuoted: false }
  if (msg.videoMessage) return { type: 'video', message: msg, isQuoted: false, seconds: msg.videoMessage.seconds || 0 }

  const vo = msg.viewOnceMessage?.message || msg.viewOnceMessageV2?.message
  if (vo?.imageMessage) return { type: 'image', message: vo, isQuoted: false }
  if (vo?.videoMessage) return { type: 'video', message: vo, isQuoted: false, seconds: vo.videoMessage.seconds || 0 }

  const ctx =
    msg.extendedTextMessage?.contextInfo ||
    msg.imageMessage?.contextInfo ||
    msg.videoMessage?.contextInfo ||
    null
  const quoted = ctx?.quotedMessage
  if (!quoted) return null

  if (quoted.imageMessage) {
    return { type: 'image', message: quoted, isQuoted: true, stanzaId: ctx.stanzaId, participant: ctx.participant }
  }
  if (quoted.videoMessage) {
    return {
      type: 'video',
      message: quoted,
      isQuoted: true,
      stanzaId: ctx.stanzaId,
      participant: ctx.participant,
      seconds: quoted.videoMessage?.seconds || 0
    }
  }
  if (quoted.stickerMessage) {
    return { type: 'sticker', message: quoted, isQuoted: true, stanzaId: ctx.stanzaId, participant: ctx.participant }
  }
  const qvo = quoted.viewOnceMessage?.message || quoted.viewOnceMessageV2?.message
  if (qvo?.imageMessage) {
    return { type: 'image', message: qvo, isQuoted: true, stanzaId: ctx.stanzaId, participant: ctx.participant }
  }
  if (qvo?.videoMessage) {
    return {
      type: 'video',
      message: qvo,
      isQuoted: true,
      stanzaId: ctx.stanzaId,
      participant: ctx.participant,
      seconds: qvo.videoMessage?.seconds || 0
    }
  }
  return null
}

function detectMode(q) {
  const a = String(q || '').toLowerCase().trim()
  if (!a) return 'normal'
  if (/quadrad|crop|square/.test(a)) return 'square'
  if (/estic|stretch|full/.test(a)) return 'stretch'
  if (/circul|circle|redond/.test(a)) return 'circle'
  if (/blur|desfoq/.test(a)) return 'blur'
  if (/gray|pb|preto|branco/.test(a)) return 'gray'
  if (/invert|negativ/.test(a)) return 'invert'
  if (/pixel/.test(a)) return 'pixel'
  if (/bord/.test(a)) return 'border'
  return 'normal'
}

module.exports = {
  name: 'sticker',
  description: 'Figurinha rápida: normal, quadrada, esticar, círculo, blur, pb, invert, pixel, borda',
  category: 'cmds-aleatorios',
  aliases: ['s', 'f', 'fig', 'figurinha', 'stiker', 'st'],
  cooldown: 2,

  async execute({ client, nyx, from, info, reply, reagir, q, sender }) {
    const sock = nyx || client

    try {
      const media = resolveMedia(info)
      if (!media) {
        return reply(
          `❗ Envie ou *responda* uma imagem/vídeo\n\n` +
            `📌 *Modos rápidos (foto):*\n` +
            `• .s → normal\n` +
            `• .s quadrada → crop centro\n` +
            `• .s esticar → preenche 512\n` +
            `• .s circulo → redonda\n` +
            `• .s blur → desfoque\n` +
            `• .s pb → preto e branco\n` +
            `• .s invert → negativo\n` +
            `• .s pixel → pixelado\n` +
            `• .s borda → borda vermelha`
        )
      }

      const mode = detectMode(q)
      await reagir('⏳')

      let mediaMsg
      if (media.isQuoted) {
        mediaMsg = {
          key: {
            remoteJid: from,
            fromMe: false,
            id: media.stanzaId,
            participant: media.participant || sender
          },
          message: media.message
        }
      } else {
        mediaMsg = info
      }

      const buffer = await downloadMediaMessage(mediaMsg, 'buffer', {})
      if (!buffer || buffer.length < 50) {
        await reagir('❌')
        return reply('❌ Não consegui baixar a mídia.')
      }

      const meta = loadPackMeta()
      let webpBuf

      if (media.type === 'video') {
        if ((media.seconds || 0) > 10) {
          await reagir('❌')
          return reply('❌ Vídeo no máx. *10s*.')
        }
        webpBuf = await videoToStickerBuffer(buffer, mode)
      } else {
        // imagem / sticker — sharp (rápido)
        webpBuf = await imageToStickerBuffer(buffer, mode)
      }

      await sendSticker(sock, from, webpBuf, info, meta)
      await reagir('✅')
    } catch (e) {
      console.error('[sticker]', e)
      try { await reagir('❌') } catch {}
      reply('❌ Erro na figurinha: `' + (e.message || e) + '`')
    }
  }
}
