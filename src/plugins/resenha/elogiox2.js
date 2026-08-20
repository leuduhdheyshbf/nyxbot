'use strict'

const ITEMS = [
  "Você eleva a conversa.",
  "Seu humor salva o dia.",
  "O grupo fica melhor com você."
]

module.exports = {
  name: 'elogiox2',
  description: "Elogio 2",
  category: 'resenha',
  aliases: ["elogiox2"],
  cooldown: 3,
  async execute({ reply, reagir }) {
    await reagir('✨')
    const pick = ITEMS[Math.floor(Math.random() * ITEMS.length)]
    await reply(`✨ *Elogio*\n\n${pick}`)
  }
}
