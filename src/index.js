// ============================================
// CORREÇÃO DE FUSO HORÁRIO PARA O RENDER
// ============================================
process.env.TZ = 'America/Sao_Paulo'

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
const { startConnection, getSock } = require('./core/client')
const { handleMessage } = require('./handlers/messageHandler')
const { handleGroupUpdate } = require('./handlers/groupUpdateHandler')
const { ensureDir, safeUnlink } = require('./utils/helpers')
const db = require('./core/database') // Importante para o agendamento

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

app.listen(PORT, () => {
  console.log(`✅ Servidor HTTP rodando na porta ${PORT}`)
})
// ============================================

// ============================================
// VERIFICADOR DE AGENDAMENTOS (Supabase)
// ============================================
const verificarAgendamentos = async () => {
  try {
    const agora = new Date()
    const horaAtual = agora.getHours().toString().padStart(2, '0')
    const minAtual = agora.getMinutes().toString().padStart(2, '0')
    const horarioAtual = `${horaAtual}:${minAtual}`

    const { data, error } = await db.supabase
    .from('agendamentos_fechar')
    .select('*')
    .eq('horario_fechar', horarioAtual)

    if (error) {
      console.error('[Agendamento] Erro na consulta:', error.message)
      return
    }

    if (!data || data.length === 0) return

      for (const row of data) {
        const groupId = row.group_id
        const minutosAbrir = row.minutos_abrir

        try {
          const sock = getSock()
          if (!sock) {
            console.error('[Agendamento] Socket não está disponível.')
            continue
          }

          console.log(`[Agendamento] Fechando grupo ${groupId} conforme agendado (${horarioAtual})`)
          await sock.groupSettingUpdate(groupId, 'announcement')
          await sock.groupSettingUpdate(groupId, 'restrict')

          await sock.sendMessage(groupId, {
            text: `🔒 *GRUPO FECHADO!*\n\n` +
            `🕒 Horário agendado: ${horarioAtual}\n` +
            `⏳ Será reaberto em *${minutosAbrir} minuto(s)*`
          })

          if (minutosAbrir > 0) {
            setTimeout(async () => {
              try {
                console.log(`[Agendamento] Abrindo grupo ${groupId} após ${minutosAbrir} min`)
                await sock.groupSettingUpdate(groupId, 'not_announcement')
                await sock.groupSettingUpdate(groupId, 'not_restrict')
                await sock.sendMessage(groupId, {
                  text: `🔓 *GRUPO REABERTO!*\n\nO tempo de bloqueio acabou.`
                })
              } catch (err) {
                console.error('[Agendamento] Erro ao abrir:', err.message)
              }
            }, minutosAbrir * 60 * 1000)
          }

          await db.supabase.from('agendamentos_fechar').delete().eq('group_id', groupId)

        } catch (err) {
          console.error('[Agendamento] Erro ao executar para o grupo:', groupId, err.message)
        }
      }

  } catch (err) {
    console.error('[Agendamento] Erro geral:', err.message)
  }
}

// Roda a verificação a cada 60 segundos (1 minuto)
setInterval(verificarAgendamentos, 60 * 1000)
verificarAgendamentos()
// ============================================

async function main() {
  CyanLog('🩸 Nyx Bot V2 iniciando...')
  await startConnection({
    config,
    onMessage: (upsert, sock) => handleMessage(upsert, sock, { config, cmdManager }),
                        onGroupUpdate: (ev, sock) => handleGroupUpdate(ev, sock)
  })
  GreenLog('Core pronto. Aguardando conexão WhatsApp...')
}

main().catch((e) => {
  RedLog(e.message)
  process.exit(1)
})
