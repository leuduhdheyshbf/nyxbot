const fs = require('fs')
const { drawQuote } = require('../../modules/games/imageBoard')
const { safeUnlink } = require('../../utils/helpers')
module.exports = {
  name: 'invert',
  description: 'Inverte maiúsculas/minúsculas',
  category: 'resenha',
  aliases: ['inverter'],
  async execute({ client, from, info, reply, reagir, q, args }) {
    const texto = q || args.join(' ')
    if (!texto) return reply('❗ Use: .invert [texto]')
    await reagir('🔄')
    const text = [...texto].map(c => c === c.toUpperCase() ? c.toLowerCase() : c.toUpperCase()).join('')
    try {
      const img = await drawQuote({ title: 'Invertido', emoji: '🔄', text })
      await client.sendMessage(from, { image: fs.readFileSync(img), caption: `🔄 ${text}` }, { quoted: info })
      safeUnlink(img)
    } catch { await reply(`🔄 ${text}`) }
  }
}
