'use strict'

const ITEMS = [
  "Segunda detectada.",
  "Café em dose de combate.",
  "Tutorial do sofrimento."
]

module.exports = {
  name: 'segunda2',
  description: "Segunda",
  category: 'resenha',
  aliases: ["segunda2"],
  cooldown: 3,
  async execute({ reply, reagir }) {
    await reagir('😩')
    const pick = ITEMS[Math.floor(Math.random() * ITEMS.length)]
    await reply(`😩 *Segunda*\n\n${pick}`)
  }
}
