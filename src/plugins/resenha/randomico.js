'use strict'

const ITEMS = [
  "Sim.",
  "Não.",
  "Talvez.",
  "Pergunta depois."
]

module.exports = {
  name: 'randomico',
  description: "Aleatório",
  category: 'resenha',
  aliases: ["randomico"],
  cooldown: 3,
  async execute({ reply, reagir }) {
    await reagir('🎲')
    const pick = ITEMS[Math.floor(Math.random() * ITEMS.length)]
    await reply(`🎲 *Aleatório*\n\n${pick}`)
  }
}
