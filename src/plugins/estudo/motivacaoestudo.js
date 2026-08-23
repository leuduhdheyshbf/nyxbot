'use strict'

const ITEMS = [
  "1 hora honesta > 5 horas fingindo.",
  "Comece a página.",
  "Questão errada = mapa de revisão."
]

module.exports = {
  name: 'motivacaoestudo',
  description: "Motivação estudo",
  category: 'estudo',
  aliases: ["motiestudo"],
  cooldown: 3,
  async execute({ reply, reagir }) {
    await reagir('📖')
    const pick = ITEMS[Math.floor(Math.random() * ITEMS.length)]
    await reply(`📖 *Motivação estudo*\n\n${pick}`)
  }
}
