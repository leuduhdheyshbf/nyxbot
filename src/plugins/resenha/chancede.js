'use strict'
module.exports = {
  name: 'chancede',
  description: 'Chance de %',
  category: 'resenha',
  aliases: [],
  cooldown: 3,
  async execute({ reply, reagir, args, pushname }) {
    await reagir('📈')
    const alvo = (args || []).join(' ').trim() || pushname || 'você'
    const pct = Math.floor(Math.random() * 101)
    await reply(`📈 *Chance de*\n\n*${alvo}*: **${pct}%**`)
  }
}
