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
    browser: ['Nyx Bot', 'Chrome', '120.0.0.0'],
                            msgRetryCounterCache,
                            syncFullHistory: false,
                            generateHighQualityLinkPreview: true,
                            getMessage: async () => undefined
  })

  sockGlobal = sock
  global.sock = sock

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
  // ✅ SOMENTE group-participants.update (SEM groups.update)
  // ============================================
  if (typeof onGroupUpdate === 'function') {
    sock.ev.on('group-participants.update', (ev) => {
      console.log('[CLIENT] group-participants.update:', ev?.action, ev?.participants?.length)
      onGroupUpdate(ev, sock)
    })
  }

  return sock
}

function getSock() {
  return sockGlobal
}

module.exports = { startConnection, getSock }
