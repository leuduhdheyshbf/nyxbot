'use strict'

const fs = require('fs')
const path = require('path')
const axios = require('axios')
const { RedLog, CyanLog } = require('../core/logger')
const db = require('../core/database')

const DEFAULT_IMAGE_PATH = path.join(__dirname, '..', 'assets', 'welcome-default.jpeg')

// 🔥 CONTROLE PARA NÃO ENVIAR REPETIDO
const sentLog = new Map()

// 🔥 LÊ DO SUPABASE
async function isWelcomeEnabled(groupId) {
  try {
    const { data, error } = await db.supabase
    .from('boas_vindas')
    .select('*')
    .eq('group_id', groupId)
    .maybeSingle()

    if (error) {
      console.error(`❌ [SUPABASE] Erro:`, error.message)
      return false
    }

    return data ? data.ativo === true : false
  } catch (err) {
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
    // 🔥 EVITA ENVIAR DUAS VEZES PARA A MESMA PESSOA NO MESMO GRUPO
    const key = `${groupId}:${participantJid}`
    if (sentLog.has(key)) {
      console.log(`⏭️ [IGNORADO] ${participantJid} já recebeu welcome no ${groupId}`)
      return
    }
    sentLog.set(key, Date.now())

    // Limpa o cache depois de 1 minuto
    setTimeout(() => sentLog.delete(key), 60000)

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
  }
}

// 🔥 CONTROLE DE GRUPOS PROCESSADOS
const processedGroups = new Set()

async function handleGroupUpdate(update, sock) {
  try {
    if (!update || !update.id) return

      const groupId = update.id
      let action = update.action
      let participants = update.participants || []

      // Opcionalmente limite o welcome a um grupo específico.
      // Sem WELCOME_GROUP_ID, o recurso funciona em qualquer grupo habilitado no Supabase.
      const targetGroup = process.env.WELCOME_GROUP_ID?.trim()
      if (targetGroup && groupId !== targetGroup) {
        return
      }

      // 🔥 EVITA PROCESSAR O MESMO GRUPO VÁRIAS VEZES
      if (processedGroups.has(groupId)) {
        console.log(`⏭️ [IGNORADO] Grupo ${groupId} já foi processado`)
        return
      }

      // Normaliza participantes
      if (participants.length > 0) {
        if (typeof participants[0] === 'string') {
          participants = participants.map(p => ({ id: p }))
        } else if (participants[0]?.id) {
          // já está certo
        } else if (participants[0]?.phoneNumber) {
          participants = participants.map(p => ({ id: p.phoneNumber }))
        }
      }

      if (!action && participants.length > 0) {
        action = 'add'
      }

      console.log(`[HANDLER] Grupo: ${groupId}, Ação: ${action}, Participantes: ${participants.length}`)

      if (action !== 'add') return
        if (!participants.length) return

          // 🔥 VERIFICA NO SUPABASE
          const isActive = await isWelcomeEnabled(groupId)
          console.log(`[HANDLER] 🎯 Welcome ativo no SUPABASE? ${isActive}`)

          if (!isActive) {
            console.log('[HANDLER] ❌ Welcome desativado no SUPABASE')
            return
          }

          // 🔥 MARCA COMO PROCESSADO
          processedGroups.add(groupId)
          setTimeout(() => processedGroups.delete(groupId), 5000)

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
  }
}

module.exports = {
  handleGroupUpdate,
  sendWelcome,
  WELCOME_CAPTION
}
