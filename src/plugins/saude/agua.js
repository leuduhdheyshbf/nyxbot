'use strict'

const ITEMS = [
  "Hora de beber água.",
  "Um gole agora.",
  "Água > terceiro café."
]

module.exports = {
  name: 'agua',
  description: "Lembrete de água",
  category: 'saude',
  aliases: ["beberagua"],
  cooldown: 3,
  async execute({ reply, reagir }) {
    await reagir('💧')
    const pick = ITEMS[Math.floor(Math.random() * ITEMS.length)]
    await reply(`💧 *Lembrete de água*\n\n${pick}`)
  }
}
