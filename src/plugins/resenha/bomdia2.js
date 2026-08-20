'use strict'

const ITEMS = [
  "Acorde. O caos começou.",
  "Café primeiro.",
  "Bom dia pra quem vai tentar."
]

module.exports = {
  name: 'bomdia2',
  description: "Bom dia",
  category: 'resenha',
  aliases: ["bomdia2"],
  cooldown: 3,
  async execute({ reply, reagir }) {
    await reagir('☀️')
    const pick = ITEMS[Math.floor(Math.random() * ITEMS.length)]
    await reply(`☀️ *Bom dia*\n\n${pick}`)
  }
}
