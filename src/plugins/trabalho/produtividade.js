'use strict'

const ITEMS = [
  "Pomodoro: 25 min foco + 5 min pausa.",
  "Bloqueie notificações por 1 hora.",
  "Pior tarefa primeiro.",
  "Uma aba só."
]

module.exports = {
  name: 'produtividade',
  description: "Dica de produtividade",
  category: 'trabalho',
  aliases: ["produtivo", "foco"],
  cooldown: 3,
  async execute({ reply, reagir }) {
    await reagir('⚡')
    const pick = ITEMS[Math.floor(Math.random() * ITEMS.length)]
    await reply(`⚡ *Dica de produtividade*\n\n${pick}`)
  }
}
