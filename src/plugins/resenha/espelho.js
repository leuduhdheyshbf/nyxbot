const fs = require('fs')
const { drawQuote } = require('../../modules/games/imageBoard')
const { safeUnlink } = require('../../utils/helpers')
module.exports = {
  name: 'espelho',
  description: 'Espelha o texto',
  category: 'resenha',
  aliases: [],
  async execute({ client, from, info, reply, reagir, args, q }) {
    const texto = q || args.join(' ')
    if (!texto) return reply('❗ Use: .espelho [texto]')
    await reagir('🪞')
    const text = texto.split('').reverse().join('')
    try {
      const img = await drawQuote({ title: 'Espelho', emoji: '🪞', text })
      await client.sendMessage(from, { image: fs.readFileSync(img), caption: `🪞 ${text}` }, { quoted: info })
      safeUnlink(img)
    } catch { await reply(`🪞 ${text}`) }
  }
}
