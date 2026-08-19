const { downloadMediaMessage, getContentType } = require('@whiskeysockets/baileys')
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
  for (let i = 0; i < 5; i++) {
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

async function downloadBuffer(sock, downloadMsg) {
  // Baileys moderno: passa reuploadRequest
  try {
    return await downloadMediaMessage(
      downloadMsg,
      'buffer',
      {},
      sock ? { reuploadRequest: sock.updateMediaMessage } : {}
    )
  } catch (e1) {
    // fallback sem options
    return await downloadMediaMessage(downloadMsg, 'buffer', {})
  }
}

module.exports = {
  name: 'salvarviewonce',
  description: 'Revela foto/video/audio de visualizacao unica (responda a midia com . ou .revela)',
  category: 'utilidades',
  aliases: ['.', 'revelar', 'reveal', 'abrirvisu', 'vervisu', 'vv2', 'readvo', 'viewonce', 'vo', 'salvarviewonce'],

  async execute(ctx) {
    const sock = ctx.nyx || ctx.columbina || ctx.sock || null
    const { from, info, reply, reagir, sender, config } = ctx

    const safeReply = async (t) => {
      try {
        if (typeof reply === 'function') await reply(t)
        else if (sock) await sock.sendMessage(from, { text: t }, { quoted: info })
      } catch (e) {
        console.error('[revela] reply fail:', e?.message || e)
      }
    }
    const safeReact = async (emoji) => {
      try {
        if (typeof reagir === 'function') await reagir(emoji)
        else if (sock) await sock.sendMessage(from, { react: { text: emoji, key: info.key } })
      } catch {}
    }

    console.log('[revela] start | from=', from, '| sender=', sender)

    if (!sock || typeof sock.sendMessage !== 'function') {
      console.error('[revela] sem socket. keys=', Object.keys(ctx || {}))
      return safeReply('❌ Conexão do bot indisponível.')
    }

    try {
      const ctxInfo = getCtxInfo(info)
      const quotedRaw = ctxInfo?.quotedMessage

      if (!quotedRaw) {
        await safeReact('❌')
        return safeReply('❌ *Como usar:*\n1. Responda uma *visualização única*\n2. Envie `.` ou `.revela`')
      }

      console.log('[revela] quoted keys:', Object.keys(quotedRaw))

      const found = findMedia(quotedRaw)
      if (!found) {
        await safeReact('❌')
        return safeReply('❌ A mensagem marcada não tem mídia suportada.')
      }

      const vo = isProbablyViewOnce(quotedRaw, found.media)
      console.log('[revela] tipo=', found.type, '| viewOnce=', vo)

      const stanzaId = ctxInfo.stanzaId || ctxInfo.stanzaID || ctxInfo.quotedMessageId
      const participant = ctxInfo.participant || ctxInfo.participantAlt || info.key?.participant

      const downloadMsg = {
        key: {
          remoteJid: from,
          fromMe: false,
          id: stanzaId,
          participant
        },
        message: found.message
      }

      let buffer
      try {
        buffer = await downloadBuffer(sock, downloadMsg)
      } catch (e1) {
        console.error('[revela] download erro1:', e1?.message || e1)
        // tenta com a mensagem quoted inteira unwrap
        try {
          downloadMsg.message = unwrap(quotedRaw)
          buffer = await downloadBuffer(sock, downloadMsg)
        } catch (e2) {
          console.error('[revela] download erro2:', e2?.message || e2)
          await safeReact('❌')
          return safeReply('❌ Não consegui baixar a mídia.\n\nDica: responda a view once *logo após* ser enviada (antes de expirar).')
        }
      }

      if (!buffer || !Buffer.isBuffer(buffer) || !buffer.length) {
        await safeReact('❌')
        return safeReply('❌ Mídia vazia ou já expirada.')
      }

      console.log('[revela] buffer bytes=', buffer.length)

      const caption =
        (vo ? '🔓 *Visu única revelada!*\n\n' : '🔓 *Mídia revelada*\n\n') +
        '👤 De: @' + String(participant || sender || '').split('@')[0] + '\n' +
        '📅 ' + new Date().toLocaleString('pt-BR')

      const mentions = []
      if (participant) mentions.push(participant)

      // Destinos: 1) PV de quem usou  2) fallback no próprio chat
      const destinos = []
      if (sender) destinos.push(sender)
      // se sender for lid, tenta tambem numero do config dono
      if (config?.NumeroDoDono) {
        const n = String(config.NumeroDoDono).replace(/\D/g, '')
        if (n) destinos.push(n + '@s.whatsapp.net')
      }
      destinos.push(from) // ultimo recurso: manda no grupo/chat

      const uniqueDest = [...new Set(destinos.filter(Boolean))]

      let enviado = false
      let lastErr = null

      for (const dest of uniqueDest) {
        try {
          console.log('[revela] enviando para', dest)
          if (found.type === 'image') {
            await sock.sendMessage(dest, { image: buffer, caption, mentions })
          } else if (found.type === 'video') {
            await sock.sendMessage(dest, { video: buffer, caption, mentions })
          } else if (found.type === 'audio') {
            await sock.sendMessage(dest, {
              audio: buffer,
              mimetype: found.media?.mimetype || 'audio/ogg; codecs=opus',
              ptt: !!found.media?.ptt
            })
            await sock.sendMessage(dest, { text: caption, mentions })
          } else if (found.type === 'sticker') {
            await sock.sendMessage(dest, { sticker: buffer })
            await sock.sendMessage(dest, { text: caption, mentions })
          } else if (found.type === 'document') {
            await sock.sendMessage(dest, {
              document: buffer,
              mimetype: found.media?.mimetype || 'application/octet-stream',
              fileName: found.media?.fileName || 'arquivo'
            })
          }
          enviado = true
          console.log('[revela] ok ->', dest)
          break
        } catch (e) {
          lastErr = e
          console.error('[revela] falha envio', dest, e?.message || e)
        }
      }

      if (!enviado) {
        await safeReact('❌')
        return safeReply('❌ Falha ao enviar a mídia: ' + (lastErr?.message || 'erro desconhecido'))
      }

      await safeReact('✅')
      await safeReply(vo
        ? '✅ View once revelada e enviada!'
        : '✅ Mídia enviada!')
    } catch (e) {
      console.error('[revela] fatal:', e)
      await safeReact('❌')
      await safeReply('❌ Erro: ' + (e.message || e))
    }
  }
}
