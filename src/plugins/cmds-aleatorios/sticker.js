'use strict'

const path = require('path')
const fs = require('fs')
const { downloadMediaMessage } = require('@whiskeysockets/baileys')

// exif2.js fica na raiz do projeto
const ROOT = path.join(__dirname, '..', '..', '..')
const { sendImageAsSticker2, sendVideoAsSticker2 } = require(path.join(ROOT, 'exif2.js'))

function loadPackMeta() {
  // tenta config/config.json (V2) e depois database/config.json (legado)
  const candidates = [
    path.join(ROOT, 'config', 'config.json'),
    path.join(ROOT, 'database', 'config.json')
  ]
  for (const fp of candidates) {
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

/**
 * Detecta mídia na mensagem atual OU na mensagem citada (reply).
 * Funciona mesmo sem isQuotedImage no ctx.
 */
function resolveMedia(info) {
  const msg = info.message || {}

  // 1) mídia enviada junto com o comando (caption)
  if (msg.imageMessage) {
    return { type: 'image', message: msg, isQuoted: false }
  }
  if (msg.videoMessage) {
    return { type: 'video', message: msg, isQuoted: false }
  }
  // viewOnce
  if (msg.viewOnceMessage?.message?.imageMessage || msg.viewOnceMessageV2?.message?.imageMessage) {
    const inner = msg.viewOnceMessage?.message || msg.viewOnceMessageV2?.message
    return { type: 'image', message: inner, isQuoted: false }
  }
  if (msg.viewOnceMessage?.message?.videoMessage || msg.viewOnceMessageV2?.message?.videoMessage) {
    const inner = msg.viewOnceMessage?.message || msg.viewOnceMessageV2?.message
    return { type: 'video', message: inner, isQuoted: false }
  }

  // 2) mídia citada (responder com .s)
  const ctx =
    msg.extendedTextMessage?.contextInfo ||
    msg.imageMessage?.contextInfo ||
    msg.videoMessage?.contextInfo ||
    msg.stickerMessage?.contextInfo ||
    null

  const quoted = ctx?.quotedMessage
  if (!quoted) return null

  if (quoted.imageMessage) {
    return {
      type: 'image',
      message: quoted,
      isQuoted: true,
      stanzaId: ctx.stanzaId,
      participant: ctx.participant
    }
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
  if (quoted.viewOnceMessage?.message?.imageMessage || quoted.viewOnceMessageV2?.message?.imageMessage) {
    const inner = quoted.viewOnceMessage?.message || quoted.viewOnceMessageV2?.message
    return { type: 'image', message: inner, isQuoted: true, stanzaId: ctx.stanzaId, participant: ctx.participant }
  }
  if (quoted.viewOnceMessage?.message?.videoMessage || quoted.viewOnceMessageV2?.message?.videoMessage) {
    const inner = quoted.viewOnceMessage?.message || quoted.viewOnceMessageV2?.message
    return {
      type: 'video',
      message: inner,
      isQuoted: true,
      stanzaId: ctx.stanzaId,
      participant: ctx.participant,
      seconds: inner.videoMessage?.seconds || 0
    }
  }
  // sticker citado → reprocessa como imagem base
  if (quoted.stickerMessage) {
    return {
      type: 'sticker',
      message: quoted,
      isQuoted: true,
      stanzaId: ctx.stanzaId,
      participant: ctx.participant
    }
  }

  return null
}

module.exports = {
  name: 'sticker',
  description: 'Transforma imagem ou vídeo em figurinha (normal / quadrada / esticada)',
  category: 'cmds-aleatorios',
  aliases: ['s', 'f', 'fig', 'figurinha', 'stiker'],
  cooldown: 4,

  async execute({ client, nyx, from, info, reply, reagir, q, sender }) {
    const sock = nyx || client

    try {
      const media = resolveMedia(info)

      if (!media) {
        return reply(
          `❗ Envie ou *responda* uma *imagem* ou *vídeo* com o comando\n\n` +
            `📌 Opções:\n` +
            `• .s → normal (mantém proporção)\n` +
            `• .s quadrada → corta no centro\n` +
            `• .s esticar → estica pra preencher`
        )
      }

      // modo
      const arg = String(q || '').toLowerCase().trim()
      let mode = 'normal'
      if (arg.includes('quadrad') || arg.includes('crop') || arg.includes('square')) {
        mode = 'square'
      } else if (arg.includes('estic') || arg.includes('stretch') || arg.includes('full')) {
        mode = 'stretch'
      }

      await reagir('⏳')

      // monta objeto que o Baileys consegue baixar
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
      if (!buffer || buffer.length < 100) {
        await reagir('❌')
        return reply('❌ Erro ao baixar a mídia. Tente enviar de novo.')
      }

      const { packname, author } = loadPackMeta()
      const meta = { packname, author, mode }

      if (media.type === 'video') {
        const seconds =
          media.seconds ||
          media.message?.videoMessage?.seconds ||
          info.message?.videoMessage?.seconds ||
          0
        if (seconds > 10) {
          await reagir('❌')
          return reply('❌ O vídeo precisa ter no máximo *10 segundos*.')
        }
        await sendVideoAsSticker2(sock, from, buffer, info, meta)
      } else {
        // image ou sticker
        await sendImageAsSticker2(sock, from, buffer, info, meta)
      }

      await reagir('✅')
    } catch (e) {
      console.error('[sticker]', e)
      try { await reagir('❌') } catch {}
      reply('❌ Deu erro ao criar a figurinha.\n`' + (e.message || e) + '`')
    }
  }
}
