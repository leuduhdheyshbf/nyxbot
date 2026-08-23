'use strict'

const ITEMS = [
  "Desliga o cérebro.",
  "Salva o progresso e dorme.",
  "Boa noite."
]

module.exports = {
  name: 'boanoite2',
  description: "Boa noite",
  category: 'resenha',
  aliases: ["boanoite2"],
  cooldown: 3,
  async execute({ reply, reagir }) {
    await reagir('🌙')
    const pick = ITEMS[Math.floor(Math.random() * ITEMS.length)]
    await reply(`🌙 *Boa noite*\n\n${pick}`)
  }
}
