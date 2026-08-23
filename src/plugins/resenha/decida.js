'use strict'

const ITEMS = [
  "Opção A.",
  "Opção B.",
  "Nenhuma. Durma.",
  "Adia 10 min."
]

module.exports = {
  name: 'decida',
  description: "Decida",
  category: 'resenha',
  aliases: ["decida"],
  cooldown: 3,
  async execute({ reply, reagir }) {
    await reagir('🪙')
    const pick = ITEMS[Math.floor(Math.random() * ITEMS.length)]
    await reply(`🪙 *Decida*\n\n${pick}`)
  }
}
