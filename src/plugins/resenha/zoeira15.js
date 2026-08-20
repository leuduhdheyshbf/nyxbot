'use strict'

const ITEMS = [
  "Seu Wi-Fi social está instável.",
  "Diagnóstico: precisa de férias.",
  "Você é o DLC pago do grupo."
]

module.exports = {
  name: 'zoeira15',
  description: "Zoeira 15",
  category: 'resenha',
  aliases: ["zoeira15"],
  cooldown: 3,
  async execute({ reply, reagir }) {
    await reagir('🤡')
    const pick = ITEMS[Math.floor(Math.random() * ITEMS.length)]
    await reply(`🤡 *Zoeira*\n\n${pick}`)
  }
}
