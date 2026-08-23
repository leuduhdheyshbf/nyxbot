const fs = require('fs')
const { drawQuote } = require('../../modules/games/imageBoard')
const { safeUnlink } = require('../../utils/helpers')
module.exports = {
  name: 'aleatorio',
  description: 'Número aleatório 1-10',
  category: 'resenha',
  aliases: ['random'],
  async execute({ client, from, info, reply, reagir }) {
    await reagir('🎲')
    const n = Math.floor(Math.random() * 10) + 1
    try {
      const img = await drawQuote({ title: 'Aleatório', emoji: '🎲', text: String(n) })
      await client.sendMessage(from, { image: fs.readFileSync(img), caption: `🎲 Número: *${n}*` }, { quoted: info })
      safeUnlink(img)
    } catch { await reply(`🎲 Número: *${n}*`) }
  }
}
