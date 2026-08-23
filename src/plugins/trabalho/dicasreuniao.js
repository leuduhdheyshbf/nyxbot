'use strict'

const ITEMS = [
  "Toda reunião precisa de pauta e horário de fim.",
  "Se não tem decisão, vira e-mail.",
  "Anote ações com responsável e prazo."
]

module.exports = {
  name: 'dicasreuniao',
  description: "Dica de reunião",
  category: 'trabalho',
  aliases: ["reuniao"],
  cooldown: 3,
  async execute({ reply, reagir }) {
    await reagir('📅')
    const pick = ITEMS[Math.floor(Math.random() * ITEMS.length)]
    await reply(`📅 *Dica de reunião*\n\n${pick}`)
  }
}
