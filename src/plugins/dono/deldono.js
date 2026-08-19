'use strict'

const db = require('../../core/database')

module.exports = {
  name: 'deldono',
  description: 'Remove um dono extra',
  category: 'dono',
  aliases: ['delowner'],
  dono: true,
  cooldown: 2,

  async execute({ reply, args, mentionedJid, quotedParticipant }) {
    const target =
      (mentionedJid && mentionedJid[0]) ||
      quotedParticipant ||
      (args[0] ? args[0].replace(/\D/g, '') + '@s.whatsapp.net' : null)

    if (!target) return reply('❗ Use: .deldono @pessoa')

    const ok = await db.removeDono(target)
    if (!ok) return reply('❌ Falha ao remover dono.')

    const tag = '@' + target.split('@')[0]
    await reply(`👢 ${tag} removido da lista de donos.`, { mentions: [target] })
  }
}
