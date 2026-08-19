const fs = require('fs')
const { drawQuote } = require('../../modules/games/imageBoard')
const { safeUnlink } = require('../../utils/helpers')

const ITEMS = ["A noite é mais escura antes do amanhecer.", "Quem não arrisca não petisca.", "O caos é uma escada.", "Sangue chama sangue."]

module.exports = {
  name: 'frase',
  description: 'Frase',
  category: 'resenha',
  aliases: [],
  async execute({ client, from, info, reply, reagir, q }) {
    await reagir('📝')
    const text = ITEMS[Math.floor(Math.random() * ITEMS.length)]
    try {
      const img = await drawQuote({ title: 'Frase', emoji: '📝', text })
      await client.sendMessage(from, {
        image: fs.readFileSync(img),
        caption: `📝 *Frase*\n\n${text}`
      }, { quoted: info })
      safeUnlink(img)
    } catch {
      await reply(`📝 *Frase*\n\n${text}`)
    }
  }
}
