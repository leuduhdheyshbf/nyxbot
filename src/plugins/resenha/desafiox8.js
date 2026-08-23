'use strict'

const ITEMS = [
  "1h sem redes.",
  "Elogio sincero pra alguém.",
  "Beba 2 copos de água."
]

module.exports = {
  name: 'desafiox8',
  description: "Desafio 8",
  category: 'resenha',
  aliases: ["desafiox8"],
  cooldown: 3,
  async execute({ reply, reagir }) {
    await reagir('🎯')
    const pick = ITEMS[Math.floor(Math.random() * ITEMS.length)]
    await reply(`🎯 *Desafio*\n\n${pick}`)
  }
}
