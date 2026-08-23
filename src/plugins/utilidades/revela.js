'use strict'

/**
 * Revela mídia de visualização única (view once).
 * Comando principal: .  (ponto)  — aliases: revela, revelar, reveal, vo
 * Uso: responda a mídia VO com .   ou  .revela
 */

const { downloadMediaMessage } = require('@whiskeysockets/baileys')
const fs = require('fs')
const path = require('path')

function getCtxInfo(info) {
  const msg = info?.message || {}
  return (
    msg.extendedTextMessage?.contextInfo ||
    msg.imageMessage?.contextInfo ||
    msg.videoMessage?.contextInfo ||
    msg.buttonsResponseMessage?.contextInfo ||
    msg.templateButtonReplyMessage?.contextInfo ||
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

function findMedia(raw) {
  const m = unwrap(raw) || {}
  if (m.imageMessage) return { type: 'image', media: m.imageMessage, message: { imageMessage: m.imageMessage } }
  if (m.videoMessage) return { type: 'video', media: m.videoMessage, message: { videoMessage: m.videoMessage } }
  if (m.audioMessage) return { type: 'audio', media: m.audioMessage, message: { audioMessage: m.audioMessage } }
  if (m.stickerMessage) return { type: 'sticker', media: m.stickerMessage, message: { stickerMessage: m.stickerMessage } }
  if (m.documentMessage) return { type: 'document', media: m.documentMessage, message: { documentMessage: m.documentMessage } }
  return null
}

function isProbablyViewOnce(raw, mediaNode) {
  if (!raw) return false
  if (raw.viewOnceMessage || raw.viewOnceMessageV2 || raw.viewOnceMessageV2Extension) return true
  if (mediaNode?.viewOnce === true) return true
  return false
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
  // nome "." — com prefixo "." o usuário digita ".." OU só "." (handler trata)
  name: '.',
  description: 'Revela mídia de visualização única (responda com .)',
  category: 'utilidades',
  aliases: ['revela', 'revelar', 'reveal', 'vo'],
  cooldown: 2,

  async execute({ client, from, info, reply, sender, isGroup }) {
    const ctxInfo = getCtxInfo(info)
    const quotedMsg = ctxInfo?.quotedMessage
    if (!quotedMsg) {
      return reply('❗ Responda a uma mídia de *visualização única* com `.` ou `.revela`')
    }

    const found = findMedia(quotedMsg)
    if (!found) {
      return reply('❌ Nenhuma mídia encontrada na mensagem citada.')
    }

    const vo = isProbablyViewOnce(quotedMsg, found.media)
    // permite mesmo se não detectar VO (às vezes some o flag)
    try {
      const downloadMsg = {
        key: {
          remoteJid: from,
          id: ctxInfo.stanzaId || info.key?.id,
          fromMe: false,
          participant: ctxInfo.participant
        },
        message: found.message
      }

      const buffer = await downloadBuffer(client, downloadMsg)
      if (!buffer || !buffer.length) {
        return reply('❌ Não foi possível baixar a mídia.')
      }

      // envia no PV do usuário (mais seguro); se falhar, no chat atual
      const dest = sender || from
      const caption = vo ? '🔓 *View once revelada*' : '📎 Mídia recuperada'

      let payload
      if (found.type === 'image') {
        payload = { image: buffer, caption }
      } else if (found.type === 'video') {
        payload = { video: buffer, caption }
      } else if (found.type === 'audio') {
        payload = { audio: buffer, mimetype: found.media.mimetype || 'audio/ogg; codecs=opus', ptt: !!found.media.ptt }
      } else if (found.type === 'sticker') {
        payload = { sticker: buffer }
      } else {
        payload = {
          document: buffer,
          mimetype: found.media.mimetype || 'application/octet-stream',
          fileName: found.media.fileName || 'arquivo'
        }
      }

      try {
        await client.sendMessage(dest, payload)
        if (isGroup && dest !== from) {
          await reply('✅ Enviei a mídia no seu *PV*.')
        }
      } catch {
        await client.sendMessage(from, payload, { quoted: info })
      }
    } catch (e) {
      console.error('[revela]', e)
      reply(`❌ Erro ao revelar: ${e.message}`)
    }
  }
}
