'use strict'
module.exports = {
  name: 'tediohoje',
  description: 'Tédio %',
  category: 'resenha',
  aliases: [],
  cooldown: 3,
  async execute({ reply, reagir, args, pushname }) {
    await reagir('😐')
    const alvo = (args || []).join(' ').trim() || pushname || 'você'
    const pct = Math.floor(Math.random() * 101)
    await reply(`😐 *Tédio*\n\n*${alvo}*: **${pct}%**`)
  }
}
