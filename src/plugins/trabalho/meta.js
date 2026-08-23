'use strict'
module.exports = {
  name: 'meta',
  description: 'Define meta do dia',
  category: 'trabalho',
  aliases: ['goaldia'],
  cooldown: 3,
  async execute({ reply, reagir, args, prefix }) {
    await reagir('🎯')
    const p = prefix || '.'
    const texto = (args || []).join(' ').trim()
    if (!texto) return reply(`🎯 Uso: *${p}meta estudar 2 capítulos*`)
    await reply(`🎯 *Meta*\n\n📌 ${texto}`)
  }
}
