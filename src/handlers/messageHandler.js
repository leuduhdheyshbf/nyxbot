'use strict'

const db = require('../core/database')
const { groups: groupCache } = require('../core/cache')
const { logCommand, RedLog } = require('../core/logger')
const { toJid, cleanNumber, getGroupAdmins, sameUser, isParticipantAdmin, isParticipantSuperAdmin, participantIds } = require('../utils/helpers')
const levels = require('../modules/levels')
const economy = require('../modules/economy')

/** Desembrulha ephemeral / viewOnce / documentWithCaption / edited etc. */
function unwrapMessage(msg) {
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
      if (!next || next === cur) break
        cur = next
    }
    return cur
}

function getMessageBody(msg) {
  if (!msg) return ''
    const m = unwrapMessage(msg) || msg
    return (
      m.conversation ||
      m.extendedTextMessage?.text ||
      m.imageMessage?.caption ||
      m.videoMessage?.caption ||
      m.documentMessage?.caption ||
      m.buttonsResponseMessage?.selectedDisplayText ||
      m.listResponseMessage?.title ||
      m.templateButtonReplyMessage?.selectedDisplayText ||
      m.interactiveResponseMessage?.body?.text ||
      m.buttonsMessage?.contentText ||
      m.templateMessage?.hydratedTemplate?.hydratedContentText ||
      m.groupInviteMessage?.caption ||
      m.groupInviteMessage?.groupName ||
      ''
    )
}

const LINK_RE = /(https?:\/\/[^\s]+)|(www\.[^\s]+)|(wa\.me\/[^\s]+)|(chat\.whatsapp\.com\/[^\s]+)/i

/** Detecta link no texto OU em qualquer campo relevante da mensagem (convite de grupo, preview, etc.) */
function messageHasLink(msg, body) {
  if (body && LINK_RE.test(body)) return true
    if (!msg) return false
      try {
        const m = unwrapMessage(msg) || msg
        // convite nativo de grupo do WhatsApp
        if (m.groupInviteMessage) return true
          // inviteCode / groupJid dentro do objeto
          if (m.groupInviteMessage?.inviteCode) return true
            // varre strings úteis (não o message inteiro pra não pegar false positive em media keys)
            const parts = [
              m.extendedTextMessage?.text,
              m.extendedTextMessage?.matchedText,
              m.extendedTextMessage?.contextInfo?.externalAdReply?.sourceUrl,
              m.extendedTextMessage?.contextInfo?.externalAdReply?.mediaUrl,
              m.extendedTextMessage?.contextInfo?.externalAdReply?.thumbnailUrl,
              m.imageMessage?.caption,
              m.videoMessage?.caption,
              m.documentMessage?.caption,
              m.conversation,
              m.groupInviteMessage?.inviteCode,
              m.groupInviteMessage?.groupJid,
              m.groupInviteMessage?.caption,
              m.templateMessage?.hydratedTemplate?.hydratedContentText,
              m.buttonsMessage?.contentText
            ]
            for (const p of parts) {
              if (p && LINK_RE.test(String(p))) return true
                if (p && /chat\.whatsapp\.com|wa\.me\//i.test(String(p))) return true
            }
            // fallback: JSON raso só com campos de texto conhecidos
            const raw = JSON.stringify({
              t: m.extendedTextMessage?.text,
              c: m.conversation,
              g: m.groupInviteMessage,
              cap: m.imageMessage?.caption || m.videoMessage?.caption
            })
            if (LINK_RE.test(raw) || /chat\.whatsapp\.com|wa\.me\//i.test(raw)) return true
      } catch {}
      return false
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

  // Dono: número no config OU é o próprio bot
  const senderNum = cleanNumber(sender)
  const botId = sock.user?.id || ''
  const botNum = cleanNumber(botId)

  const donoList = Array.isArray(config.NumeroDoDono)
  ? config.NumeroDoDono
  : [config.NumeroDoDono]

  const donoNumeros = donoList.map((n) => cleanNumber(n)).filter(Boolean)

  let isDono =
  (senderNum && donoNumeros.includes(senderNum)) ||
  (senderNum && botNum && senderNum === botNum) ||
  donoList.some((d) => sameUser(d, sender)) ||
  sameUser(botId, sender)

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
    isSuperAdmin: false,
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
      const parts = meta.participants || []
      ctx.groupAdmins = getGroupAdmins(parts)
      ctx.isBotAdmin = isParticipantAdmin(parts, sock.user?.id) ||
      ctx.groupAdmins.some((a) => sameUser(a, sock.user?.id))
      ctx.isSuperAdmin = isParticipantSuperAdmin(parts, ctx.sender)
      ctx.isAdmin = !!(ctx.isDono || ctx.isSuperAdmin || isParticipantAdmin(parts, ctx.sender))
      ctx.isAdm = ctx.isAdmin
      ctx.isBotAdm = ctx.isBotAdmin
      ctx.groupMembers = parts
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

                // mute (formato: { groupId: { userJid: data } } ou array legado)
                if (ctx.isGroup && !ctx.isAdmin) {
                  const mutes = db.getMutes() || {}
                  const groupMutes = mutes[ctx.from]
                  let isMuted = false
                  if (Array.isArray(groupMutes)) {
                    isMuted = groupMutes.some((j) => sameUser(j, ctx.sender))
                  } else if (groupMutes && typeof groupMutes === 'object') {
                    for (const jid of Object.keys(groupMutes)) {
                      if (sameUser(jid, ctx.sender)) {
                        const row = groupMutes[jid]
                        // respeita mute temporário
                        if (row && row.until_ts && Number(row.until_ts) < Date.now()) {
                          try { await db.removeMute(ctx.from, jid) } catch {}
                          continue
                        }
                        isMuted = true
                        break
                      }
                    }
                  }
                  if (isMuted) {
                    try {
                      await sock.sendMessage(ctx.from, { delete: info.key })
                    } catch {}
                    return
                  }
                }

                // =========================================================
                // ANTILINK CORRIGIDO
                // =========================================================
                if (ctx.isGroup && !ctx.isAdmin) {
                  const antilinkOn = typeof db.getGroupFeature === 'function'
                  ? db.getGroupFeature(ctx.from, 'antilink')
                  : !!(db.getFeatures() || {}).antilink
                  if (antilinkOn && messageHasLink(info.message, body)) {
                    if (!ctx.isBotAdmin) {
                      // bot precisa ser admin para apagar; avisa só uma vez por grupo (evita spam)
                      try {
                        const key = `antilink_need_admin:${ctx.from}`
                        if (!global.__nyxAntilinkWarn) global.__nyxAntilinkWarn = new Set()
                          if (!global.__nyxAntilinkWarn.has(key)) {
                            global.__nyxAntilinkWarn.add(key)
                            await sock.sendMessage(ctx.from, {
                              text: '⚠️ *Antilink ativo*, mas o bot precisa ser *admin* do grupo para apagar links.'
                            })
                          }
                      } catch {}
                      return
                    }

                    // CORREÇÃO: Primeiro tenta APAGAR o link, depois avisa
                    try {
                      // 1. Tenta apagar a mensagem com o link
                      await sock.sendMessage(ctx.from, { delete: info.key })

                      // 2. Só DEPOIS de apagar com sucesso, envia o aviso
                      try {
                        await sock.sendMessage(ctx.from, { text: '🔗 Link removido (antilink).' })
                      } catch {
                        // Se falhar ao enviar o aviso, ignora (o link já foi apagado)
                      }

                    } catch (e) {
                      // 3. Se a primeira tentativa de apagar falhar, tenta um fallback
                      try {
                        await sock.sendMessage(ctx.from, {
                          delete: {
                            remoteJid: ctx.from,
                            fromMe: false,
                            id: info.key.id,
                            participant: info.key.participant || info.key.participantAlt || ctx.sender
                          }
                        })
                      } catch (e2) {
                        RedLog(`antilink delete: ${e2.message || e.message}`)
                      }
                    }

                    return // Garante que o fluxo pare depois de processar o antilink
                  }
                }
                // =========================================================

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
