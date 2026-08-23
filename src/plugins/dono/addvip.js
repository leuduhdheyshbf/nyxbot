'use strict'

const db = require('../../core/database')

module.exports = {
  name: 'addvip',
  description: 'Adiciona um usuário VIP/premium',
  category: 'dono',
  aliases: ['addpremium', 'addprem'],
  dono: true,
  cooldown: 2,

  async execute({ reply, args, mentionedJid, quotedParticipant, sender }) {
    const target =
      (mentionedJid && mentionedJid[0]) ||
      quotedParticipant ||
      (args[0] ? args[0].replace(/\D/g, '') + '@s.whatsapp.net' : null)

    if (!target) return reply('❗ Use: .addvip @pessoa')

    const ok = await db.addPremium(target, { by: sender })
    if (!ok) return reply('❌ Falha ao adicionar VIP (veja logs).')

    const tag = '@' + target.split('@')[0]
    await reply(`💎 ${tag} agora é *VIP/Premium*!`, { mentions: [target] })
  }
}
