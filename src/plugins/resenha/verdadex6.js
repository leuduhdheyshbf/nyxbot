'use strict'

const ITEMS = [
  "Você procrastina o que importa.",
  "Finge que não se importa.",
  "Medo de começar te trava."
]

module.exports = {
  name: 'verdadex6',
  description: "Verdade 6",
  category: 'resenha',
  aliases: ["verdadex6"],
  cooldown: 3,
  async execute({ reply, reagir }) {
    await reagir('🪞')
    const pick = ITEMS[Math.floor(Math.random() * ITEMS.length)]
    await reply(`🪞 *Verdade*\n\n${pick}`)
  }
}
