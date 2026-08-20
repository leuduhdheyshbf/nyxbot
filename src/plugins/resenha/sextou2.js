'use strict'

const ITEMS = [
  "Sextou oficial.",
  "Produtividade em economia.",
  "Liberado."
]

module.exports = {
  name: 'sextou2',
  description: "Sextou",
  category: 'resenha',
  aliases: ["sextou2"],
  cooldown: 3,
  async execute({ reply, reagir }) {
    await reagir('🎉')
    const pick = ITEMS[Math.floor(Math.random() * ITEMS.length)]
    await reply(`🎉 *Sextou*\n\n${pick}`)
  }
}
