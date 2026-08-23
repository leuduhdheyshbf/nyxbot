'use strict'

const db = require('../../core/database')
const { toJid, cleanNumber } = require('../../utils/helpers')

module.exports = {
  name: 'mute',
  description: 'Silencia um membro (apaga msgs dele)',
  category: 'admin',
  aliases: ['silenciar'],

  async execute({ from, info, reply, reagir, isGroup, isAdm, isDono, args, sender }) {
    if (!isGroup) return reply('❌ Só em grupos.')
    if (!isAdm && !isDono) return reply('❌ Só admins.')

    const quoted = info.message?.extendedTextMessage?.contextInfo
    let target = quoted?.participant || quoted?.mentionedJid?.[0]
    if (!target && args[0]) {
      const n = cleanNumber(args[0])
      if (n) target = n + '@s.whatsapp.net'
    }
    target = toJid(target) || target
    if (!target) return reply('❗ Marque ou responda alguém.\nEx: .mute @pessoa')

    await db.setMute(from, target, { by: sender, reason: 'mute' })
    if (typeof reagir === 'function') await reagir('🔇')
    return reply(`🔇 @${String(target).split('@')[0]} foi silenciado.\nUse .unmute para liberar.`)
  }
}
