const fs = require('fs')
const { drawQuote } = require('../../modules/games/imageBoard')
const { safeUnlink } = require('../../utils/helpers')
module.exports = {
  name: 'imitar',
  description: 'Fala como Imitar',
  category: 'resenha',
  aliases: [],
  async execute({ client, from, info, reply, reagir, args, q }) {
    const texto = q || args.join(' ') || 'Olá'
    await reagir('🎭')
    const text = '🎭 *Imitação:* {t}'.replace('{t}', texto)
    try {
      const img = await drawQuote({ title: 'Imitar', emoji: '🎭', text })
      await client.sendMessage(from, { image: fs.readFileSync(img), caption: `🎭 ${text}` }, { quoted: info })
      safeUnlink(img)
    } catch { await reply(`🎭 ${text}`) }
  }
}
