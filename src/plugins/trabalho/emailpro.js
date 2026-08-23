'use strict'

const ITEMS = [
  "Assunto claro > assunto criativo.",
  "Primeira linha: o pedido.",
  "Use bullets.",
  "Revise anexos antes de enviar."
]

module.exports = {
  name: 'emailpro',
  description: "Dica de e-mail",
  category: 'trabalho',
  aliases: ["emailpro"],
  cooldown: 3,
  async execute({ reply, reagir }) {
    await reagir('📧')
    const pick = ITEMS[Math.floor(Math.random() * ITEMS.length)]
    await reply(`📧 *Dica de e-mail*\n\n${pick}`)
  }
}
