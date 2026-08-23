'use strict'

const db = require('../../core/database')

module.exports = {
  name: 'adddono',
  description: 'Adiciona um dono extra (salvo no Supabase)',
  category: 'dono',
  aliases: ['addowner'],
  dono: true,
  cooldown: 2,

  async execute({ reply, args, mentionedJid, quotedParticipant }) {
    const target =
      (mentionedJid && mentionedJid[0]) ||
      quotedParticipant ||
      (args[0] ? args[0].replace(/\D/g, '') + '@s.whatsapp.net' : null)

    if (!target) return reply('❗ Use: .adddono @pessoa')

    const ok = await db.addDono(target)
    if (!ok) return reply('❌ Falha ao adicionar dono.')

    const tag = '@' + target.split('@')[0]
    await reply(`👑 ${tag} agora é *dono* do bot!`, { mentions: [target] })
  }
}
