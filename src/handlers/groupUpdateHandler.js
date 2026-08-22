'use strict'

const fs = require('fs')
const path = require('path')
const axios = require('axios')
const { RedLog, CyanLog } = require('../core/logger')

const WELCOME_PATH = path.join(__dirname, '..', '..', 'database', 'json', 'welcome.json')
const DEFAULT_IMAGE_PATH = path.join(__dirname, '..', 'assets', 'welcome-default.jpeg')

function isWelcomeEnabled(groupId) {
  try {
    if (!fs.existsSync(WELCOME_PATH)) return false
      const data = JSON.parse(fs.readFileSync(WELCOME_PATH, 'utf8'))
      const groups = Array.isArray(data) ? data : data.groups || []
      return groups.includes(groupId)
  } catch {
    return false
  }
}

const WELCOME_CAPTION = `🎰 *BEM-VINDO A LAS VEGAS* 🎰
╰──────────────────────────╯
💸 *A sorte está do seu lado.*
🎲 *Vamos jogar?*
▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬
📌 *Para começar, se apresente:*
🃏 Foto ou vídeo
👤 Nome
🎂 Idade
📍 Cidade
▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬
💰 *A mesa está aberta.*
♠️ *Nyx Bot te dá as boas-vindas.*`

async function getProfilePictureUrl(sock, jid) {
  try {
    const url = await sock.profilePictureUrl(jid, 'image')
    return url || null
  } catch {
    return null
  }
}

async function downloadImageBuffer(url) {
  try {
    const res = await axios.get(url, {
      responseType: 'arraybuffer',
      timeout: 15000,
      headers: { 'User-Agent': 'NyxBot/2.0' }
    })
    return Buffer.from(res.data)
  } catch {
    return null
  }
}

function getDefaultImageBuffer() {
  try {
    if (fs.existsSync(DEFAULT_IMAGE_PATH)) {
      return fs.readFileSync(DEFAULT_IMAGE_PATH)
    }
  } catch {}
  return null
}

async function sendWelcome(sock, groupId, participantJid) {
  try {
    console.log(`📤 Enviando welcome para ${participantJid}`)

    const imageUrl = await getProfilePictureUrl(sock, participantJid)
    let buffer = null
    let usedFallback = false

    if (imageUrl) {
      buffer = await downloadImageBuffer(imageUrl)
    }

    if (!buffer) {
      buffer = getDefaultImageBuffer()
      usedFallback = true
    }

    const mentionTag = `@${participantJid.split('@')[0]}`
    const caption = `${mentionTag}\n\n${WELCOME_CAPTION}`

    if (buffer) {
      await sock.sendMessage(groupId, {
        image: buffer,
        caption,
        mentions: [participantJid]
      })
    } else {
      await sock.sendMessage(groupId, {
        text: caption,
        mentions: [participantJid]
      })
    }

    console.log(`✅ Welcome enviado para ${participantJid}`)
    CyanLog(`✅ Welcome enviado para ${participantJid}`)
  } catch (err) {
    console.error(`❌ Erro no sendWelcome: ${err.message}`)
    RedLog(`sendWelcome: ${err.message}`)
  }
}

async function handleGroupUpdate(update, sock) {
  try {
    console.log('[HANDLER] Update recebido:', JSON.stringify(update, null, 2))

    if (!update || !update.id) {
      console.log('[HANDLER] Sem ID, ignorando')
      return
    }

    const groupId = update.id
    let action = update.action
    let participants = update.participants || []

    // 🔥 Normaliza participantes
    if (participants.length > 0) {
      if (typeof participants[0] === 'string') {
        participants = participants.map(p => ({ id: p }))
      } else if (participants[0]?.id) {
        // já está certo
      } else if (participants[0]?.phoneNumber) {
        participants = participants.map(p => ({ id: p.phoneNumber }))
      }
    }

    // Se não veio action, força como 'add'
    if (!action && participants.length > 0) {
      action = 'add'
      console.log('[HANDLER] Action forçada para "add"')
    }

    console.log(`[HANDLER] Grupo: ${groupId}, Ação: ${action}, Participantes: ${participants.length}`)

    if (action !== 'add') {
      console.log(`[HANDLER] Ação não é "add" (${action}), ignorando`)
      return
    }

    if (!participants.length) {
      console.log('[HANDLER] Sem participantes, ignorando')
      return
    }

    // 🔥 Verifica se o welcome está ativo
    if (!isWelcomeEnabled(groupId)) {
      console.log('[HANDLER] Welcome desativado para este grupo')
      return
    }

    console.log('[HANDLER] ✅ Welcome ATIVO! Enviando...')

    for (const p of participants) {
      const jid = p?.id || p?.jid || p?.phoneNumber || p
      if (!jid || jid.endsWith('@g.us')) continue

        const botId = sock.user?.id || ''
        if (botId && (jid === botId || jid.split(':')[0] === botId.split(':')[0])) {
          console.log('[HANDLER] É o bot, ignorando')
          continue
        }

        console.log(`[HANDLER] Enviando welcome para ${jid}`)
        await sendWelcome(sock, groupId, jid)
    }
  } catch (err) {
    console.error('[HANDLER] Erro:', err.message)
    RedLog(`handleGroupUpdate: ${err.message}`)
  }
}

module.exports = {
  handleGroupUpdate,
  sendWelcome,
  WELCOME_CAPTION
}
