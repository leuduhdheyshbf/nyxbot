'use strict'

const ITEMS = [
  "Tela longe 30 min antes de dormir.",
  "Horário fixo de sono.",
  "Café tarde sabota a noite."
]

module.exports = {
  name: 'dicasono',
  description: "Dica de sono",
  category: 'saude',
  aliases: ["sono"],
  cooldown: 3,
  async execute({ reply, reagir }) {
    await reagir('😴')
    const pick = ITEMS[Math.floor(Math.random() * ITEMS.length)]
    await reply(`😴 *Dica de sono*\n\n${pick}`)
  }
}
