const fs = require('fs')
const { drawQuote } = require('../../modules/games/imageBoard')
const { safeUnlink } = require('../../utils/helpers')

const ITEMS = ["Você abriu e achou... uma meia.", "💎 Um cristal brilhante!", "🐍 Uma cobra de borracha.", "📜 Um mapa rasgado."]

module.exports = {
  name: 'caixa',
  description: 'Caixa Misteriosa',
  category: 'resenha',
  aliases: ["box"],
  async execute({ client, from, info, reply, reagir, q }) {
    await reagir('📦')
    const text = ITEMS[Math.floor(Math.random() * ITEMS.length)]
    try {
      const img = await drawQuote({ title: 'Caixa Misteriosa', emoji: '📦', text })
      await client.sendMessage(from, {
        image: fs.readFileSync(img),
        caption: `📦 *Caixa Misteriosa*\n\n${text}`
      }, { quoted: info })
      safeUnlink(img)
    } catch {
      await reply(`📦 *Caixa Misteriosa*\n\n${text}`)
    }
  }
}
