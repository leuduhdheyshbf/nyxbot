const fs = require('fs')
const { drawQuote } = require('../../modules/games/imageBoard')
const { safeUnlink } = require('../../utils/helpers')
module.exports = {
  name: 'pirata',
  description: 'Fala como Pirata',
  category: 'resenha',
  aliases: ["piratas"],
  async execute({ client, from, info, reply, reagir, args, q }) {
    const texto = q || args.join(' ') || 'Olá'
    await reagir('🏴‍☠️')
    const text = 'Arrr! {t} meu tesouro!'.replace('{t}', texto)
    try {
      const img = await drawQuote({ title: 'Pirata', emoji: '🏴‍☠️', text })
      await client.sendMessage(from, { image: fs.readFileSync(img), caption: `🏴‍☠️ ${text}` }, { quoted: info })
      safeUnlink(img)
    } catch { await reply(`🏴‍☠️ ${text}`) }
  }
}
