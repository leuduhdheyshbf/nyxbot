const fs = require('fs')
const { drawQuote } = require('../../modules/games/imageBoard')
const { safeUnlink } = require('../../utils/helpers')

const ITEMS = ["Você é Wi-Fi? Porque sinto a conexão.", "Seu nome é Google? Porque você tem tudo que eu procuro.", "Não sou fotógrafo, mas posso te imaginar comigo.", "Você acredita em amor à primeira vista ou preciso passar de novo?", "Se a beleza fosse tempo, você seria a eternidade."]

module.exports = {
  name: 'cantada',
  description: 'Cantada',
  category: 'resenha',
  aliases: ["paquera"],
  async execute({ client, from, info, reply, reagir, q }) {
    await reagir('💘')
    const text = ITEMS[Math.floor(Math.random() * ITEMS.length)]
    try {
      const img = await drawQuote({ title: 'Cantada', emoji: '💘', text })
      await client.sendMessage(from, {
        image: fs.readFileSync(img),
        caption: `💘 *Cantada*\n\n${text}`
      }, { quoted: info })
      safeUnlink(img)
    } catch {
      await reply(`💘 *Cantada*\n\n${text}`)
    }
  }
}
