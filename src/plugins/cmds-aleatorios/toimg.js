'use strict'

/**
 * .toimg — Converte sticker (estático ou animado) em imagem PNG
 * Uso: responda a um sticker com .toimg
 */

const sharp = require('sharp')
const { downloadMediaMessage } = require('@whiskeysockets/baileys')

function getCtxInfo(info) {
  const msg = info?.message || {}
  return (
    msg.extendedTextMessage?.contextInfo ||
    msg.imageMessage?.contextInfo ||
    msg.videoMessage?.contextInfo ||
    msg.stickerMessage?.contextInfo ||
    msg.buttonsResponseMessage?.contextInfo ||
    msg.listResponseMessage?.contextInfo ||
    null
  )
}

function unwrap(msg) {
  if (!msg || typeof msg !== 'object') return msg
  let cur = msg
  for (let i = 0; i < 6; i++) {
    const next =
      cur.ephemeralMessage?.message ||
      cur.viewOnceMessage?.message ||
      cur.viewOnceMessageV2?.message ||
      cur.viewOnceMessageV2Extension?.message ||
      cur.documentWithCaptionMessage?.message ||
      cur.editedMessage?.message ||
      null
    if (!next) break
    cur = next
  }
  return cur
}

async function downloadBuffer(client, downloadMsg) {
  try {
    return await downloadMediaMessage(
      downloadMsg,
      'buffer',
      {},
      client ? { reuploadRequest: client.updateMediaMessage } : {}
    )
  } catch {
    return await downloadMediaMessage(downloadMsg, 'buffer', {})
  }
}

module.exports = {
  name: 'toimg',
  description: 'Converte um sticker em imagem',
  category: 'cmds-aleatorios',
  aliases: ['stickerimg', 'stkimg', 'toimage'],
  cooldown: 3,

  async execute({ nyx, client, from, info, reply, react, sender }) {
    const sock = nyx || client
    try {
      const ctxInfo = getCtxInfo(info)
      const quotedRaw = ctxInfo?.quotedMessage || null

      if (!quotedRaw) {
        return reply('❌ Responda a um *sticker* com `.toimg`')
      }

      const quotedMsg = unwrap(quotedRaw)
      if (!quotedMsg?.stickerMessage) {
        return reply('❌ A mensagem respondida não é um sticker.')
      }

      const downloadMsg = {
        key: {
          remoteJid: from,
          fromMe: false,
          id: ctxInfo?.stanzaId || info.key?.id,
          participant: ctxInfo?.participant || sender
        },
        message: { stickerMessage: quotedMsg.stickerMessage }
      }

      let buffer
      try {
        buffer = await downloadBuffer(sock, downloadMsg)
      } catch (err) {
        console.error('[toimg] download:', err?.message || err)
        return reply(`❌ Erro ao baixar o sticker: ${err.message}`)
      }

      if (!buffer || !buffer.length) {
        return reply('❌ Não foi possível baixar o sticker.')
      }

      // Converte webp (estático ou 1º frame de animado) → PNG
      let imagemBuffer
      try {
        imagemBuffer = await sharp(buffer, { animated: false, pages: 1 })
          .rotate()
          .png()
          .toBuffer()
      } catch (err) {
        // Fallback Jimp 1.x
        try {
          const { Jimp } = require('jimp')
          const imagem = await Jimp.read(buffer)
          imagemBuffer = await imagem.getBuffer('image/png')
        } catch (err2) {
          console.error('[toimg] convert:', err?.message, err2?.message)
          return reply(`❌ Erro ao converter o sticker: ${err.message}`)
        }
      }

      await sock.sendMessage(
        from,
        {
          image: imagemBuffer,
          caption: '✅ Sticker convertido para imagem!'
        },
        { quoted: info }
      )

      if (typeof react === 'function') {
        await react('✅')
      } else {
        try {
          await sock.sendMessage(from, { react: { text: '✅', key: info.key } })
        } catch {}
      }
    } catch (err) {
      console.error('[toimg]', err)
      try {
        await sock.sendMessage(from, { react: { text: '❌', key: info.key } })
      } catch {}
      reply(`❌ Erro ao converter: ${err.message}`)
    }
  }
}
