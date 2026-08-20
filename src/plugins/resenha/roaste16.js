'use strict'

const ITEMS = [
  "Opinião arquivada no lixo.",
  "Bonito esforço.",
  "Carisma em modo avião."
]

module.exports = {
  name: 'roaste16',
  description: "Roast 16",
  category: 'resenha',
  aliases: ["roaste16"],
  cooldown: 3,
  async execute({ reply, reagir }) {
    await reagir('🔥')
    const pick = ITEMS[Math.floor(Math.random() * ITEMS.length)]
    await reply(`🔥 *Roast*\n\n${pick}`)
  }
}
