'use strict'

const ITEMS = [
  "Documente conquistas todo mês.",
  "Peça feedback específico.",
  "Aprenda uma skill que o time não tem."
]

module.exports = {
  name: 'carreira',
  description: "Dica de carreira",
  category: 'trabalho',
  aliases: ["carreiradica"],
  cooldown: 3,
  async execute({ reply, reagir }) {
    await reagir('🚀')
    const pick = ITEMS[Math.floor(Math.random() * ITEMS.length)]
    await reply(`🚀 *Dica de carreira*\n\n${pick}`)
  }
}
