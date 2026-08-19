const fs = require('fs')
const { drawQuote } = require('../../modules/games/imageBoard')
const { safeUnlink } = require('../../utils/helpers')
module.exports = {
  name: 'animais',
  description: 'Fala como Animal',
  category: 'resenha',
  aliases: ["animal"],
  async execute({ client, from, info, reply, reagir, args, q }) {
    const texto = q || args.join(' ') || 'Olá'
    await reagir('🐾')
    const text = '🐾 *Som animal:* {t}'.replace('{t}', texto)
    try {
      const img = await drawQuote({ title: 'Animal', emoji: '🐾', text })
      await client.sendMessage(from, { image: fs.readFileSync(img), caption: `🐾 ${text}` }, { quoted: info })
      safeUnlink(img)
    } catch { await reply(`🐾 ${text}`) }
  }
}
