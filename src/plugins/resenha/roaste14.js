'use strict'

const ITEMS = [
  "Opinião arquivada no lixo.",
  "Bonito esforço.",
  "Carisma em modo avião."
]

module.exports = {
  name: 'roaste14',
  description: "Roast 14",
  category: 'resenha',
  aliases: ["roaste14"],
  cooldown: 3,
  async execute({ reply, reagir }) {
    await reagir('🔥')
    const pick = ITEMS[Math.floor(Math.random() * ITEMS.length)]
    await reply(`🔥 *Roast*\n\n${pick}`)
  }
}
