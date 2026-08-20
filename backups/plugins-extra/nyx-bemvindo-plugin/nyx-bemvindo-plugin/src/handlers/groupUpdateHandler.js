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

/**
 * Tenta obter a URL da foto de perfil do usuário.
 * Retorna null se não tiver ou der erro.
 */
async function getProfilePictureUrl(sock, jid) {
  try {
    const url = await sock.profilePictureUrl(jid, 'image')
    return url || null
  } catch {
    return null
  }
}

/**
 * Baixa a imagem como buffer (melhor compatibilidade no Baileys).
 */
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

/**
 * Carrega a imagem padrão local (selfie dos gatos).
 */
function getDefaultImageBuffer() {
  try {
    if (fs.existsSync(DEFAULT_IMAGE_PATH)) {
      return fs.readFileSync(DEFAULT_IMAGE_PATH)
    }
  } catch {}
  return null
}

/**
 * Envia a mensagem de boas-vindas para um participante que entrou.
 */
async function sendWelcome(sock, groupId, participantJid) {
  try {
    const imageUrl = await getProfilePictureUrl(sock, participantJid)
    let buffer = null
    let usedFallback = false

    if (imageUrl) {
      buffer = await downloadImageBuffer(imageUrl)
    }

    // Sem foto de perfil ou falha no download → imagem padrão (gatos)
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
      // último recurso: só texto
      await sock.sendMessage(groupId, {
        text: caption,
        mentions: [participantJid]
      })
    }

    CyanLog(
      `Boas-vindas enviada em ${groupId} para ${participantJid}` +
        (usedFallback ? ' (imagem padrão)' : ' (foto de perfil)')
    )
  } catch (err) {
    RedLog(`sendWelcome: ${err.message}`)
  }
}

/**
 * Handler do evento group-participants.update do Baileys.
 */
async function handleGroupUpdate(update, sock) {
  try {
    if (!update || !update.id) return

    const groupId = update.id
    const action = update.action
    const participants = update.participants || []

    // Só processa entrada de novos membros
    if (action !== 'add') return
    if (!participants.length) return

    // Verifica se o sistema está ativo neste grupo
    if (!isWelcomeEnabled(groupId)) return

    for (const p of participants) {
      const jid = typeof p === 'string' ? p : p?.id || p?.jid || p?.phoneNumber
      if (!jid || jid.endsWith('@g.us')) continue

      // Evita boas-vindas para o próprio bot
      const botId = sock.user?.id || ''
      if (botId && (jid === botId || jid.split(':')[0] === botId.split(':')[0])) {
        continue
      }

      await sendWelcome(sock, groupId, jid)
    }
  } catch (err) {
    RedLog(`handleGroupUpdate: ${err.message}`)
  }
}

module.exports = {
  handleGroupUpdate,
  sendWelcome,
  WELCOME_CAPTION
}
