'use strict'

const ITEMS = [
  "1h sem redes.",
  "Elogio sincero pra alguém.",
  "Beba 2 copos de água."
]

module.exports = {
  name: 'desafiox13',
  description: "Desafio 13",
  category: 'resenha',
  aliases: ["desafiox13"],
  cooldown: 3,
  async execute({ reply, reagir }) {
    await reagir('🎯')
    const pick = ITEMS[Math.floor(Math.random() * ITEMS.length)]
    await reply(`🎯 *Desafio*\n\n${pick}`)
  }
}
