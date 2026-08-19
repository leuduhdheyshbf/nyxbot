const fs = require('fs')
const { drawQuote } = require('../../modules/games/imageBoard')
const { safeUnlink } = require('../../utils/helpers')

const ITEMS = ["Sim.", "Não.", "Talvez.", "Depende.", "Com certeza.", "Nem pensar.", "Pergunta pro vento."]

module.exports = {
  name: 'resposta',
  description: 'Resposta',
  category: 'resenha',
  aliases: [],
  async execute({ client, from, info, reply, reagir, q }) {
    await reagir('💬')
    const text = ITEMS[Math.floor(Math.random() * ITEMS.length)]
    try {
      const img = await drawQuote({ title: 'Resposta', emoji: '💬', text })
      await client.sendMessage(from, {
        image: fs.readFileSync(img),
        caption: `💬 *Resposta*\n\n${text}`
      }, { quoted: info })
      safeUnlink(img)
    } catch {
      await reply(`💬 *Resposta*\n\n${text}`)
    }
  }
}
