'use strict'

const ITEMS = [
  "Blocos de 25–40 min com pausa.",
  "Explique em voz alta (Feynman).",
  "Revise no dia seguinte.",
  "Faça questões, não só releia."
]

module.exports = {
  name: 'dicaestudo',
  description: "Dica de estudo",
  category: 'estudo',
  aliases: ["study"],
  cooldown: 3,
  async execute({ reply, reagir }) {
    await reagir('📚')
    const pick = ITEMS[Math.floor(Math.random() * ITEMS.length)]
    await reply(`📚 *Dica de estudo*\n\n${pick}`)
  }
}
