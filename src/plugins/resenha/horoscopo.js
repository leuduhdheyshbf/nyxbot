const fs = require('fs')
const { drawQuote } = require('../../modules/games/imageBoard')
const { safeUnlink } = require('../../utils/helpers')

const ITEMS = ["Hoje é dia de arriscar.", "Evite discussões.", "Alguém pensa em você.", "Finanças em alta.", "Coração em alerta."]

module.exports = {
  name: 'horoscopo',
  description: 'Horóscopo',
  category: 'resenha',
  aliases: ["signo"],
  async execute({ client, from, info, reply, reagir, q }) {
    await reagir('🔮')
    const text = ITEMS[Math.floor(Math.random() * ITEMS.length)]
    try {
      const img = await drawQuote({ title: 'Horóscopo', emoji: '🔮', text })
      await client.sendMessage(from, {
        image: fs.readFileSync(img),
        caption: `🔮 *Horóscopo*\n\n${text}`
      }, { quoted: info })
      safeUnlink(img)
    } catch {
      await reply(`🔮 *Horóscopo*\n\n${text}`)
    }
  }
}
