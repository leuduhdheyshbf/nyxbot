'use strict'

const ITEMS = [
  "Opinião arquivada no lixo.",
  "Bonito esforço.",
  "Carisma em modo avião."
]

module.exports = {
  name: 'roaste3',
  description: "Roast 3",
  category: 'resenha',
  aliases: ["roaste3"],
  cooldown: 3,
  async execute({ reply, reagir }) {
    await reagir('🔥')
    const pick = ITEMS[Math.floor(Math.random() * ITEMS.length)]
    await reply(`🔥 *Roast*\n\n${pick}`)
  }
}
