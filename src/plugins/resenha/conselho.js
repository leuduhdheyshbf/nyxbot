const fs = require('fs')
const { drawQuote } = require('../../modules/games/imageBoard')
const { safeUnlink } = require('../../utils/helpers')

const ITEMS = ["Beba água.", "Durma cedo hoje.", "Mande mensagem para quem você gosta.", "Não discuta com gente no Twitter.", "Faça uma pausa e respire."]

module.exports = {
  name: 'conselho',
  description: 'Conselho',
  category: 'resenha',
  aliases: ["advice"],
  async execute({ client, from, info, reply, reagir, q }) {
    await reagir('💡')
    const text = ITEMS[Math.floor(Math.random() * ITEMS.length)]
    try {
      const img = await drawQuote({ title: 'Conselho', emoji: '💡', text })
      await client.sendMessage(from, {
        image: fs.readFileSync(img),
        caption: `💡 *Conselho*\n\n${text}`
      }, { quoted: info })
      safeUnlink(img)
    } catch {
      await reply(`💡 *Conselho*\n\n${text}`)
    }
  }
}
