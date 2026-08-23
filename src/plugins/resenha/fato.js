const fs = require('fs')
const { drawQuote } = require('../../modules/games/imageBoard')
const { safeUnlink } = require('../../utils/helpers')

const ITEMS = ["Polvos têm três corações.", "Mel nunca estraga.", "Bananas são bagas, morangos não.", "Um dia em Vênus é mais longo que um ano.", "Tubarões existem há mais tempo que árvores."]

module.exports = {
  name: 'fato',
  description: 'Fato Curioso',
  category: 'resenha',
  aliases: ["curiosidade"],
  async execute({ client, from, info, reply, reagir, q }) {
    await reagir('🧠')
    const text = ITEMS[Math.floor(Math.random() * ITEMS.length)]
    try {
      const img = await drawQuote({ title: 'Fato Curioso', emoji: '🧠', text })
      await client.sendMessage(from, {
        image: fs.readFileSync(img),
        caption: `🧠 *Fato Curioso*\n\n${text}`
      }, { quoted: info })
      safeUnlink(img)
    } catch {
      await reply(`🧠 *Fato Curioso*\n\n${text}`)
    }
  }
}
