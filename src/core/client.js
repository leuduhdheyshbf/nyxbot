'use strict'

const {
  default: makeWASocket,
    useMultiFileAuthState,
    DisconnectReason,
    fetchLatestBaileysVersion,
    makeCacheableSignalKeyStore,
    Browsers
} = require('@whiskeysockets/baileys')
const { Boom } = require('@hapi/boom')
const pino = require('pino')
const path = require('path')
const fs = require('fs')
const NodeCache = require('node-cache')
const qrcode = require('qrcode-terminal')
const { CyanLog, GreenLog, RedLog, YellowLog } = require('./logger')
const { ensureDir } = require('../utils/helpers')

const ROOT = path.join(__dirname, '..', '..')
const AUTH_DIR = path.join(ROOT, 'database', 'Nyx-QR')
const msgRetryCounterCache = new NodeCache()

ensureDir(AUTH_DIR)
ensureDir(path.join(ROOT, 'temp'))

let isReconnecting = false
let sockGlobal = null

async function startConnection({ onMessage, onGroupUpdate, config }) {
  if (isReconnecting) {
    CyanLog('Reconexão já em andamento...')
    return null
  }
  isReconnecting = true

  const usePairingCode = process.argv.includes('--code')
  const { state, saveCreds } = await useMultiFileAuthState(AUTH_DIR)
  const { version } = await fetchLatestBaileysVersion()
  const logger = pino({ level: 'silent' })

  const sock = makeWASocket({
    version,
    logger,
    printQRInTerminal: !usePairingCode,
    auth: {
      creds: state.creds,
      keys: makeCacheableSignalKeyStore(state.keys, logger)
    },
    browser: Browsers.ubuntu('Chrome'),
                            msgRetryCounterCache,
                            syncFullHistory: false,
                            generateHighQualityLinkPreview: true,
                            getMessage: async () => undefined
  })

  sockGlobal = sock

  if (usePairingCode && !sock.authState.creds.registered) {
    const phone = config.NumeroDoDono?.replace(/\D/g, '')
    if (phone) {
      await new Promise((r) => setTimeout(r, 2000))
      try {
        const code = await sock.requestPairingCode(phone)
        GreenLog(`📱 Código de pareamento: ${code}`)
      } catch (e) {
        RedLog(`Erro pairing code: ${e.message}`)
      }
    }
  }

  sock.ev.on('creds.update', saveCreds)

  sock.ev.on('connection.update', async (update) => {
    const { connection, lastDisconnect, qr } = update
    if (qr && !usePairingCode) {
      YellowLog('Escaneie o QR Code:')
      qrcode.generate(qr, { small: true })
    }
    if (connection === 'open') {
      isReconnecting = false
      GreenLog(`✅ Conectado como ${sock.user?.id || '?'}`)
    }
    if (connection === 'close') {
      const status = new Boom(lastDisconnect?.error)?.output?.statusCode
      const shouldReconnect = status !== DisconnectReason.loggedOut
      RedLog(`Conexão fechada (${status}). Reconectar: ${shouldReconnect}`)
      isReconnecting = false
      if (shouldReconnect) {
        setTimeout(() => startConnection({ onMessage, onGroupUpdate, config }), 3000)
      } else {
        RedLog('Sessão encerrada. Apague database/Nyx-QR e conecte novamente.')
      }
    }
  })

  sock.ev.on('messages.upsert', async (upsert) => {
    try {
      if (typeof onMessage === 'function') await onMessage(upsert, sock)
    } catch (e) {
      RedLog(`onMessage: ${e.message}`)
    }
  })

  // ============================================
  // 🔥 WELCOME - MÉTODO GARANTIDO (com polling)
  // ============================================
  if (typeof onGroupUpdate === 'function') {
    // Evento 1: group-participants.update (padrão)
    sock.ev.on('group-participants.update', (ev) => {
      console.log('[CLIENT] group-participants.update:', ev?.action, ev?.participants?.length)
      onGroupUpdate(ev, sock)
    })

    // Evento 2: groups.update (fallback)
    sock.ev.on('groups.update', async (updates) => {
      for (const update of updates) {
        if (update.participants && update.participants.length > 0) {
          console.log('[CLIENT] groups.update capturado!')
          const formatted = {
            id: update.id,
            action: 'add',
            participants: update.participants.map(p => p.id || p)
          }
          await onGroupUpdate(formatted, sock)
        }
      }
    })

    // 🔥 Evento 3: POLLING - verifica a cada 5 segundos (MATA-PAU)
    const gruposMonitorados = new Set()

    setInterval(async () => {
      try {
        const groups = await sock.groupFetchAllParticipating()
        for (const [groupId, group] of Object.entries(groups)) {
          if (!gruposMonitorados.has(groupId)) {
            gruposMonitorados.add(groupId)
            // Pega os participantes atuais
            const currentMembers = new Set(group.participants.map(p => p.id))

            // Verifica a cada 10s se mudou
            let lastMembers = new Set(currentMembers)

            setInterval(async () => {
              try {
                const freshGroup = await sock.groupMetadata(groupId)
                const newMembers = new Set(freshGroup.participants.map(p => p.id))

                // Encontra quem entrou
                for (const member of newMembers) {
                  if (!lastMembers.has(member)) {
                    console.log(`[POLLING] Novo membro detectado: ${member}`)
                    await onGroupUpdate({
                      id: groupId,
                      action: 'add',
                      participants: [{ id: member }]
                    }, sock)
                  }
                }
                lastMembers = newMembers
              } catch (e) {}
            }, 10000) // Verifica a cada 10s
          }
        }
      } catch (e) {
        console.log('[POLLING] Erro:', e.message)
      }
    }, 30000) // Atualiza grupos a cada 30s
  }

  return sock
}

function getSock() {
  return sockGlobal
}

module.exports = { startConnection, getSock }
