'use strict'

const db = require('../../core/database')

module.exports = {
  name: 'delvip',
  description: 'Remove VIP/premium de um usuário',
  category: 'dono',
  aliases: ['delpremium', 'remvip'],
  dono: true,
  cooldown: 2,

  async execute({ reply, args, mentionedJid, quotedParticipant }) {
    const target =
      (mentionedJid && mentionedJid[0]) ||
      quotedParticipant ||
      (args[0] ? args[0].replace(/\D/g, '') + '@s.whatsapp.net' : null)

    if (!target) return reply('❗ Use: .delvip @pessoa')

    const ok = await db.removePremium(target)
    if (!ok) return reply('❌ Falha ao remover VIP.')

    const tag = '@' + target.split('@')[0]
    await reply(`💔 ${tag} não é mais VIP.`, { mentions: [target] })
  }
}
