'use strict'
module.exports = {
  name: 'sortedo',
  description: 'Sorte %',
  category: 'resenha',
  aliases: [],
  cooldown: 3,
  async execute({ reply, reagir, args, pushname }) {
    await reagir('🍀')
    const alvo = (args || []).join(' ').trim() || pushname || 'você'
    const pct = Math.floor(Math.random() * 101)
    await reply(`🍀 *Sorte*\n\n*${alvo}*: **${pct}%**`)
  }
}
