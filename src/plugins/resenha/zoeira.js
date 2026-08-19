const fs = require('fs')
const { drawQuote } = require('../../modules/games/imageBoard')
const { safeUnlink } = require('../../utils/helpers')

const ITEMS = ["Hoje é dia de caos.", "Você acordou e escolheu violência.", "O grupo não estava preparado.", "Modo zoeira: ATIVADO."]

module.exports = {
  name: 'zoeira',
  description: 'Zoeira',
  category: 'resenha',
  aliases: ["zoar"],
  async execute({ client, from, info, reply, reagir, q }) {
    await reagir('🤡')
    const text = ITEMS[Math.floor(Math.random() * ITEMS.length)]
    try {
      const img = await drawQuote({ title: 'Zoeira', emoji: '🤡', text })
      await client.sendMessage(from, {
        image: fs.readFileSync(img),
        caption: `🤡 *Zoeira*\n\n${text}`
      }, { quoted: info })
      safeUnlink(img)
    } catch {
      await reply(`🤡 *Zoeira*\n\n${text}`)
    }
  }
}
