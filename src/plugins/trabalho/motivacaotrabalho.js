'use strict'

const ITEMS = [
  "Comece pela tarefa mais difícil.",
  "25 min de foco > 2h distraído.",
  "Feito é melhor que perfeito.",
  "Checklist pequena vence a preguiça."
]

module.exports = {
  name: 'motivacaotrabalho',
  description: "Motivação para o trabalho",
  category: 'trabalho',
  aliases: ["motitrabalho"],
  cooldown: 3,
  async execute({ reply, reagir }) {
    await reagir('💼')
    const pick = ITEMS[Math.floor(Math.random() * ITEMS.length)]
    await reply(`💼 *Motivação para o trabalho*\n\n${pick}`)
  }
}
