'use strict'

/*
 * ============================================
 *  NYX BOT V2
 * ============================================
 *  Evolução da base V1 (MisheruModz / LCSX)
 *  Prefixo padrão: .
 *  Sistema de plugins + economia + níveis
 *  Jogos com imagem (Jimp)
 * ============================================
 */

const fs = require('fs')
const path = require('path')
const express = require('express')

const ROOT = path.join(__dirname, '..')
const configPath = path.join(ROOT, 'config', 'config.json')

if (!fs.existsSync(configPath)) {
  console.error('config/config.json não encontrado')
  process.exit(1)
}

const config = JSON.parse(fs.readFileSync(configPath, 'utf8'))

const { CyanLog, GreenLog, RedLog } = require('./core/logger')
const CommandManager = require('./core/commands')
const { startConnection } = require('./core/client')
const { handleMessage } = require('./handlers/messageHandler')
const { ensureDir, safeUnlink } = require('./utils/helpers')

ensureDir(path.join(ROOT, 'temp'))
ensureDir(path.join(ROOT, 'database', 'json'))

const cmdManager = new CommandManager(config)
cmdManager.carregarPlugins()
cmdManager.watch()

// Limpeza periódica de temp
const TEMP = path.join(ROOT, 'temp')
const CLEAN_MS = (config.tempCleanupMinutes || 30) * 60 * 1000
setInterval(() => {
  try {
    const files = fs.readdirSync(TEMP)
    const now = Date.now()
    for (const f of files) {
      const fp = path.join(TEMP, f)
      const st = fs.statSync(fp)
      if (now - st.mtimeMs > CLEAN_MS) safeUnlink(fp)
    }
  } catch {}
}, 10 * 60 * 1000)

process.on('uncaughtException', (err) => RedLog(`Uncaught: ${err.message}`))
process.on('unhandledRejection', (r) => RedLog(`Unhandled: ${r}`))

// ============================================
// SERVIDOR HTTP PARA O RENDER
// ============================================
const app = express()
const PORT = process.env.PORT || 8080

app.get('/', (req, res) => {
  res.send('Nyx Bot V2 Online!')
})

// Inicia o servidor HTTP
app.listen(PORT, () => {
  console.log(`✅ Servidor HTTP rodando na porta ${PORT}`)
})
// ============================================

async function main() {
  CyanLog('🩸 Nyx Bot V2 iniciando...')
  await startConnection({
    config,
    onMessage: (upsert, sock) => handleMessage(upsert, sock, { config, cmdManager })
  })
  GreenLog('Core pronto. Aguardando conexão WhatsApp...')
}

main().catch((e) => {
  RedLog(e.message)
  process.exit(1)
})
