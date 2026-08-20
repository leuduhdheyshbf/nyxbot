'use strict'
module.exports = {
  name: 'lembrete',
  description: 'Lembrete em texto',
  category: 'trabalho',
  aliases: ['reminder', 'lembrar'],
  cooldown: 3,
  async execute({ reply, reagir, args, prefix }) {
    await reagir('⏰')
    const p = prefix || '.'
    const texto = (args || []).join(' ').trim()
    if (!texto) return reply(`⏰ Uso: *${p}lembrete pagar conta 18h*`)
    await reply(`⏰ *Lembrete*\n\n📝 ${texto}`)
  }
}
