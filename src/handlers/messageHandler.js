'use strict'

const db = require('../core/database')
const { groups: groupCache } = require('../core/cache')
const { logCommand, RedLog } = require('../core/logger')
const { toJid, cleanNumber, getGroupAdmins } = require('../utils/helpers')
const levels = require('../modules/levels')
const economy = require('../modules/economy')

function getMessageBody(msg) {
  if (!msg) return ''
    return (
      msg.conversation ||
      msg.extendedTextMessage?.text ||
      msg.imageMessage?.caption ||
      msg.videoMessage?.caption ||
      msg.documentMessage?.caption ||
      msg.buttonsResponseMessage?.selectedDisplayText ||
      msg.listResponseMessage?.title ||
      ''
    )
}

function createCtx(sock, info, config, cmdManager) {
  const from = info.key.remoteJid || info.key.remoteJidAlt
  const isGroup = from?.endsWith('@g.us')
  let sender
  if (isGroup) {
    sender = info.key.participantAlt || info.key.participant || from
  } else if (info.key.fromMe) {
    sender = (sock.user?.id || '').split(':')[0] + '@s.whatsapp.net'
  } else {
    sender = info.key.remoteJidAlt || info.key.remoteJid
  }
  sender = toJid(sender) || sender

  // 🔥 CORREÇÃO DEFINITIVA - FORÇA O BOT COMO DONO
  const senderNum = cleanNumber(sender)
  const botNum = cleanNumber(sock.user?.id)

  // Converte o config para lista de números limpos (só o número, sem DDI)
  const donoNumeros = Array.isArray(config.NumeroDoDono)
  ? config.NumeroDoDono.map(n => cleanNumber(n))
  : [cleanNumber(config.NumeroDoDono)]

  // VERIFICAÇÃO INFALÍVEL: Se o sender for o bot, é dono. Se o sender estiver na lista, é dono.
  let isDono = (senderNum && donoNumeros.includes(senderNum)) || (senderNum && senderNum === botNum)

  const reply = async (text) => {
    try {
      await sock.sendMessage(from, { text: String(text) }, { quoted: info })
    } catch {
      await sock.sendMessage(from, { text: String(text) })
    }
  }

  const react = async (emoji) => {
    try {
      await sock.sendMessage(from, { react: { text: emoji, key: info.key } })
    } catch {}
  }

  const sendImage = async (fileOrBuffer, caption = '') => {
    const image = typeof fileOrBuffer === 'string' ? { url: fileOrBuffer } : fileOrBuffer
    // se for path local
    const payload =
    typeof fileOrBuffer === 'string' && !fileOrBuffer.startsWith('http')
    ? { image: require('fs').readFileSync(fileOrBuffer), caption }
    : { image, caption }
    await sock.sendMessage(from, payload, { quoted: info })
  }

  return {
    client: sock,
    columbina: sock, // alias compatível com plugins V1
    nyx: sock,       // alias usado por plugins migrados da V1
    sock,
    message: info,
    info,
    from,
    sender,
    isGroup,
    isDono,
    isAdmin: false,
    isAdm: false,       // alias
    isBotAdmin: false,
    isBotAdm: false,    // alias
    groupMetadata: null,
    groupName: '',
    groupAdmins: [],
    groupMembers: [],
    args: [],
    q: '',
    body: '',
    prefix: config.prefix,
    config,
    db,
    cmdManager,
    reply,
    react,
    reagir: react,
    sendImage,
    economy,
    levels,
    pushname: info.pushName || ''
  }
}

async function enrichGroup(ctx, sock) {
  if (!ctx.isGroup) return
    try {
      let meta = groupCache.get(ctx.from)
      if (!meta) {
        meta = await sock.groupMetadata(ctx.from)
        groupCache.set(ctx.from, meta)
      }
      ctx.groupMetadata = meta
      ctx.groupName = meta.subject || ''
      ctx.groupAdmins = getGroupAdmins(meta.participants || [])
      const botNum = cleanNumber(sock.user?.id)
      const senderNum = cleanNumber(ctx.sender)
      ctx.isBotAdmin = ctx.groupAdmins.some((a) => cleanNumber(a) === botNum)
      ctx.isAdmin = ctx.isDono || ctx.groupAdmins.some((a) => cleanNumber(a) === senderNum)
      ctx.isAdm = ctx.isAdmin
      ctx.isBotAdm = ctx.isBotAdmin
      ctx.groupMembers = meta.participants || []
    } catch (e) {
      if (!String(e.message || e).includes('rate-overlimit')) {
        RedLog(`groupMetadata: ${e.message}`)
      }
    }
}


// evita processar a mesma mensagem 2x (race notify/sync)
const recentMsgIds = new Map()
function seenMessage(id) {
  if (!id) return false
  const now = Date.now()
  if (recentMsgIds.has(id)) return true
  recentMsgIds.set(id, now)
  if (recentMsgIds.size > 500) {
    for (const [k, t] of recentMsgIds) {
      if (now - t > 60000) recentMsgIds.delete(k)
    }
  }
  return false
}

async function handleMessage(upsert, sock, { config, cmdManager }) {
  if (upsert.type !== 'notify') return  // só notify evita comando 2x (append)
    const info = upsert.messages?.[0]
    if (!info?.message) return
    if (seenMessage(info.key?.id)) return
      if (info.key.remoteJid === 'status@broadcast') return
        if (info.key.remoteJid?.endsWith('@newsletter')) return

          const ctx = createCtx(sock, info, config, cmdManager)
          if (!ctx.from) return

            // prefixo por grupo
            let prefix = config.prefix
            if (ctx.isGroup) {
              const gp = db.getGroupPrefix(ctx.from)
              if (gp) prefix = gp
            }
            ctx.prefix = prefix

            const body = getMessageBody(info.message).trim()
            ctx.body = body

            // fromMe: só processa se for comando
            if (info.key.fromMe && !body.startsWith(prefix)) return

              await enrichGroup(ctx, sock)

              // mute
              if (ctx.isGroup && !ctx.isAdmin) {
                const mutes = db.getMutes()
                if (mutes[ctx.from]?.includes(ctx.sender)) {
                  try {
                    await sock.sendMessage(ctx.from, { delete: info.key })
                  } catch {}
                  return
                }
              }

              // antilink simples
              if (ctx.isGroup && !ctx.isAdmin && ctx.isBotAdmin) {
                const feats = db.getFeatures()
                if (feats.antilink && /(https?:\/\/|www\.|wa\.me\/|chat\.whatsapp\.com)/i.test(body)) {
                  try {
                    await sock.sendMessage(ctx.from, { delete: info.key })
                    await sock.sendMessage(ctx.from, { text: '🔗 Link removido (antilink).' })
                  } catch {}
                  return
                }
              }

              // XP por mensagem (não comando)
              if (body && !body.startsWith(prefix)) {
                levels.addXp(ctx.sender, config.moeda?.xpPorMensagem ?? 5, config)
                return
              }

              if (!body.startsWith(prefix)) return

                const withoutPrefix = body.slice(prefix.length).trim()
                const parts = withoutPrefix.split(/\s+/)
                const cmdName = (parts.shift() || '').toLowerCase()
                ctx.args = parts
                ctx.q = parts.join(' ')

                let cmd = cmdManager.get(cmdName)
                // Só o prefixo (ex: ".") respondendo mídia → comando revela (nome ".")
                if (!cmd && !cmdName && body === prefix) {
                  cmd = cmdManager.get('.') || cmdManager.get('revela')
                }
                if (!cmd) return

                  // Aluguel de grupo: bloqueia comandos se expirado (dono liberado)
                  if (ctx.isGroup && !ctx.isDono) {
                    const allowAlways = new Set(['dono', 'meuid', 'ping'])
                    const cmdKey = (cmd.originalName || cmd.name || '').toLowerCase()
                    if (!allowAlways.has(cmdKey) && !(await db.isGroupActive(ctx.from))) {
                      await ctx.reply(
                        '⛔ *Bot não ativo neste grupo.*\n\n' +
                        'Peça ao dono para ativar com:\n' +
                        `*${prefix}ativar_grupo* (padrão 30 dias)`
                      )
                      return
                    }
                  }

                  const check = cmdManager.canRun(cmd, ctx)
                  if (!check.ok) {
                    await ctx.reply(check.reason)
                    return
                  }

                  logCommand({
                    nome: info.pushName || ctx.sender,
                    grupo: ctx.groupName,
                    comando: prefix + cmdName,
                    isGroup: ctx.isGroup
                  })

                  // XP por comando
                  const xpResult = levels.addXp(ctx.sender, config.moeda?.xpPorComando ?? 10, config)
                  if (xpResult.leveled) {
                    await ctx.reply(`✨ Você subiu para o nível *${xpResult.level}*!`)
                  }

                  try {
                    await cmd.execute(ctx)
                  } catch (e) {
                    RedLog(`Erro no comando ${cmdName}: ${e.message}`)
                    await ctx.reply(`❌ Erro ao executar o comando.\n\`${e.message}\``)
                  }
}

module.exports = { handleMessage }
