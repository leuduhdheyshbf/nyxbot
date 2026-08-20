'use strict'

const ITEMS = [
  "Opinião arquivada no lixo.",
  "Bonito esforço.",
  "Carisma em modo avião."
]

module.exports = {
  name: 'roaste9',
  description: "Roast 9",
  category: 'resenha',
  aliases: ["roaste9"],
  cooldown: 3,
  async execute({ reply, reagir }) {
    await reagir('🔥')
    const pick = ITEMS[Math.floor(Math.random() * ITEMS.length)]
    await reply(`🔥 *Roast*\n\n${pick}`)
  }
}
