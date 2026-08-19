'use strict'

const db = require('../../core/database')

function formatDate(ts) {
  return new Date(ts).toLocaleString('pt-BR', { timeZone: 'America/Sao_Paulo' })
}

/**
 * Aceita: 30 | 30d | 1m | 5m | 2h
 * Retorna { ms, label }
 */
function parseDuration(raw, defaultDays = 30) {
  if (raw == null || raw === '') {
    const ms = defaultDays * 24 * 60 * 60 * 1000
    return { ms, label: `${defaultDays} dia(s)`, days: defaultDays }
  }
  const s = String(raw).trim().toLowerCase()
  const m = s.match(/^(\d+)\s*(m|min|h|d|dia|dias)?$/)
  if (!m) {
    const n = parseInt(s, 10)
    if (!n || n < 1) return null
    const ms = n * 24 * 60 * 60 * 1000
    return { ms, label: `${n} dia(s)`, days: n }
  }
  const n = parseInt(m[1], 10)
  const unit = m[2] || 'd'
  if (unit === 'm' || unit === 'min') {
    return { ms: n * 60 * 1000, label: `${n} minuto(s)`, days: n / 1440 }
  }
  if (unit === 'h') {
    return { ms: n * 60 * 60 * 1000, label: `${n} hora(s)`, days: n / 24 }
  }
  return { ms: n * 24 * 60 * 60 * 1000, label: `${n} dia(s)`, days: n }
}

module.exports = {
  name: 'ativar_grupo',
  description: 'Ativa o bot no grupo (ex: 30, 30d, 1m, 2h)',
  category: 'admin',
  aliases: ['ativargrupo', 'ativar'],
  ownerOnly: true,

  async execute({ from, args, reply, isDono, sender, prefix }) {
    if (!isDono) return reply('❌ Apenas o dono do bot pode usar este comando.')

    let groupId = null
    let durRaw = null

    if (args[0] && String(args[0]).includes('@g.us')) {
      groupId = args[0]
      durRaw = args[1]
    } else if (from.endsWith('@g.us')) {
      groupId = from
      durRaw = args[0]
    } else if (args[0]) {
      groupId = args[0].endsWith('@g.us') ? args[0] : args[0] + '@g.us'
      durRaw = args[1]
    }

    if (!groupId || !groupId.endsWith('@g.us')) {
      return reply(
        `📌 *Uso:*\n` +
          `• *${prefix}ativar_grupo* 30     → 30 dias\n` +
          `• *${prefix}ativar_grupo* 1m     → 1 minuto\n` +
          `• *${prefix}ativar_grupo* 2h     → 2 horas\n` +
          `• *${prefix}ativar_grupo* <id> 30`
      )
    }

    const dur = parseDuration(durRaw, 30)
    if (!dur) return reply('⚠️ Duração inválida. Ex: 30, 1m, 5m, 2h')

    const expires = Date.now() + dur.ms
    const groups = db.load('groups')
    groups[groupId] = {
      active: true,
      expires,
      activatedAt: Date.now(),
      activatedBy: sender,
      days: dur.days,
      label: dur.label
    }
    db.markDirty('groups')
    db.flush()

    await reply(
      `✅ *Grupo ativado!*\n\n` +
        `🆔 \`${groupId}\`\n` +
        `⏱ Duração: *${dur.label}*\n` +
        `⏰ Expira: *${formatDate(expires)}*`
    )
  }
}
