'use strict'

const ITEMS = [
  "Seu Wi-Fi social está instável.",
  "Diagnóstico: precisa de férias.",
  "Você é o DLC pago do grupo."
]

module.exports = {
  name: 'zoeira10',
  description: "Zoeira 10",
  category: 'resenha',
  aliases: ["zoeira10"],
  cooldown: 3,
  async execute({ reply, reagir }) {
    await reagir('🤡')
    const pick = ITEMS[Math.floor(Math.random() * ITEMS.length)]
    await reply(`🤡 *Zoeira*\n\n${pick}`)
  }
}
