'use strict'

const db = require('../../core/database')

function formatDate(ts) {
  if (!ts) return '—'
  try {
    return new Date(ts).toLocaleString('pt-BR', { timeZone: 'America/Sao_Paulo' })
  } catch {
    return String(ts)
  }
}

function remainingLabel(expiresAt) {
  if (!expiresAt) return 'sem data'
  const ms = Number(expiresAt) - Date.now()
  if (ms <= 0) return 'expirado'
  const days = Math.floor(ms / (24 * 60 * 60 * 1000))
  const hours = Math.floor((ms % (24 * 60 * 60 * 1000)) / (60 * 60 * 1000))
  const mins = Math.floor((ms % (60 * 60 * 1000)) / (60 * 1000))
  if (days >= 1) return `${days} dia(s) e ${hours}h`
  if (hours >= 1) return `${hours}h e ${mins}m`
  return `${mins} minuto(s)`
}

module.exports = {
  name: 'aluguel',
  description: 'Mostra quanto tempo resta de aluguel no grupo',
  category: 'utilidades',
  aliases: ['dias', 'tempoaluguel', 'expira'],
  cooldown: 5,

  async execute({ from, reply, reagir, isGroup }) {
    if (!isGroup) return reply('❌ Só funciona em *grupos*.')

    await reagir('⏳')

    try {
      const g = typeof db.getGroup === 'function' ? await db.getGroup(from) : null
      if (!g || !g.active) {
        return reply('❌ Este grupo *não tem aluguel ativo*.')
      }

      const exp = g.expires_at || g.expires
      if (!exp || Number(exp) <= Date.now()) {
        return reply('⚠️ O aluguel deste grupo *já expirou*.')
      }

      return reply(
        `🩸 *Aluguel do grupo*\n\n` +
          `✅ Status: *ativo*\n` +
          `📅 Expira em: *${formatDate(exp)}*\n` +
          `⏳ Restam: *${remainingLabel(exp)}*`
      )
    } catch (e) {
      console.error('[aluguel]', e)
      return reply(`❌ Erro ao consultar aluguel: ${e.message}`)
    }
  }
}
