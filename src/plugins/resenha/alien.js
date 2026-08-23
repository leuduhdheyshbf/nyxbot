const fs = require('fs')
const { drawQuote } = require('../../modules/games/imageBoard')
const { safeUnlink } = require('../../utils/helpers')
module.exports = {
  name: 'alien',
  description: 'Fala como Alien',
  category: 'resenha',
  aliases: ["et"],
  async execute({ client, from, info, reply, reagir, args, q }) {
    const texto = q || args.join(' ') || 'Olá'
    await reagir('👽')
    const text = 'Bleep bloop... {t}'.replace('{t}', texto)
    try {
      const img = await drawQuote({ title: 'Alien', emoji: '👽', text })
      await client.sendMessage(from, { image: fs.readFileSync(img), caption: `👽 ${text}` }, { quoted: info })
      safeUnlink(img)
    } catch { await reply(`👽 ${text}`) }
  }
}
