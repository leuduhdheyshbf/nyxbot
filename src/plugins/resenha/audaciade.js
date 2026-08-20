'use strict'
module.exports = {
  name: 'audaciade',
  description: 'Audácia %',
  category: 'resenha',
  aliases: [],
  cooldown: 3,
  async execute({ reply, reagir, args, pushname }) {
    await reagir('😈')
    const alvo = (args || []).join(' ').trim() || pushname || 'você'
    const pct = Math.floor(Math.random() * 101)
    await reply(`😈 *Audácia*\n\n*${alvo}*: **${pct}%**`)
  }
}
