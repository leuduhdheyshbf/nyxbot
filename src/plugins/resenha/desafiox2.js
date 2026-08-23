'use strict'

const ITEMS = [
  "1h sem redes.",
  "Elogio sincero pra alguém.",
  "Beba 2 copos de água."
]

module.exports = {
  name: 'desafiox2',
  description: "Desafio 2",
  category: 'resenha',
  aliases: ["desafiox2"],
  cooldown: 3,
  async execute({ reply, reagir }) {
    await reagir('🎯')
    const pick = ITEMS[Math.floor(Math.random() * ITEMS.length)]
    await reply(`🎯 *Desafio*\n\n${pick}`)
  }
}
