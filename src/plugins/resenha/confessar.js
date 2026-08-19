const fs = require('fs')
const { drawQuote } = require('../../modules/games/imageBoard')
const { safeUnlink } = require('../../utils/helpers')

const ITEMS = ["Já respondi mensagem errada e finjo que não.", "Como bolo escondido.", "Tenho uma playlist vergonhosa.", "Já gostei de alguém do grupo (talvez)."]

module.exports = {
  name: 'confessar',
  description: 'Confissão',
  category: 'resenha',
  aliases: ["confissao"],
  async execute({ client, from, info, reply, reagir, q }) {
    await reagir('🙈')
    const text = ITEMS[Math.floor(Math.random() * ITEMS.length)]
    try {
      const img = await drawQuote({ title: 'Confissão', emoji: '🙈', text })
      await client.sendMessage(from, {
        image: fs.readFileSync(img),
        caption: `🙈 *Confissão*\n\n${text}`
      }, { quoted: info })
      safeUnlink(img)
    } catch {
      await reply(`🙈 *Confissão*\n\n${text}`)
    }
  }
}
