const fs = require('fs')
const { drawQuote } = require('../../modules/games/imageBoard')
const { safeUnlink } = require('../../utils/helpers')

const ITEMS = ["Qual foi a coisa mais vergonhosa que você já fez?", "Qual seu maior medo?", "Já gostou de alguém do grupo?", "Qual mentira você conta com frequência?", "Qual seu sonho secreto?", "Mande um áudio cantando", "Fale uma cantada para alguém do grupo", "Conte uma piada ruim", "Imite alguém do grupo"]

module.exports = {
  name: 'verdade',
  description: 'Verdade ou Desafio',
  category: 'resenha',
  aliases: ["verdadeoudesafio", "vdd"],
  async execute({ client, from, info, reply, reagir, q }) {
    await reagir('🎲')
    const text = ITEMS[Math.floor(Math.random() * ITEMS.length)]
    try {
      const img = await drawQuote({ title: 'Verdade ou Desafio', emoji: '🎲', text })
      await client.sendMessage(from, {
        image: fs.readFileSync(img),
        caption: `🎲 *Verdade ou Desafio*\n\n${text}`
      }, { quoted: info })
      safeUnlink(img)
    } catch {
      await reply(`🎲 *Verdade ou Desafio*\n\n${text}`)
    }
  }
}
