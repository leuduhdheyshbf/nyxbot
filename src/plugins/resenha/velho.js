const fs = require('fs')
const { drawQuote } = require('../../modules/games/imageBoard')
const { safeUnlink } = require('../../utils/helpers')
module.exports = {
  name: 'velho',
  description: 'Fala como Velho',
  category: 'resenha',
  aliases: [],
  async execute({ client, from, info, reply, reagir, args, q }) {
    const texto = q || args.join(' ') || 'Olá'
    await reagir('👴')
    const text = 'No meu tempo... {t}'.replace('{t}', texto)
    try {
      const img = await drawQuote({ title: 'Velho', emoji: '👴', text })
      await client.sendMessage(from, { image: fs.readFileSync(img), caption: `👴 ${text}` }, { quoted: info })
      safeUnlink(img)
    } catch { await reply(`👴 ${text}`) }
  }
}
