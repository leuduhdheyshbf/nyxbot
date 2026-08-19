const fs = require('fs')
const { drawQuote } = require('../../modules/games/imageBoard')
const { safeUnlink } = require('../../utils/helpers')

const ITEMS = ["Energia no máximo! ⚡", "Bateria em 12%.", "Modo turbo ativado.", "Precisa recarregar."]

module.exports = {
  name: 'energia',
  description: 'Energia',
  category: 'resenha',
  aliases: [],
  async execute({ client, from, info, reply, reagir, q }) {
    await reagir('⚡')
    const text = ITEMS[Math.floor(Math.random() * ITEMS.length)]
    try {
      const img = await drawQuote({ title: 'Energia', emoji: '⚡', text })
      await client.sendMessage(from, {
        image: fs.readFileSync(img),
        caption: `⚡ *Energia*\n\n${text}`
      }, { quoted: info })
      safeUnlink(img)
    } catch {
      await reply(`⚡ *Energia*\n\n${text}`)
    }
  }
}
