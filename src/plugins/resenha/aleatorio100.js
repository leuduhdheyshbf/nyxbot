const fs = require('fs')
const { drawQuote } = require('../../modules/games/imageBoard')
const { safeUnlink } = require('../../utils/helpers')
module.exports = {
  name: 'aleatorio100',
  description: 'Número aleatório 1-100',
  category: 'resenha',
  aliases: ['random100'],
  async execute({ client, from, info, reply, reagir }) {
    await reagir('🎲')
    const n = Math.floor(Math.random() * 100) + 1
    try {
      const img = await drawQuote({ title: '1 a 100', emoji: '🎲', text: String(n) })
      await client.sendMessage(from, { image: fs.readFileSync(img), caption: `🎲 Número: *${n}*` }, { quoted: info })
      safeUnlink(img)
    } catch { await reply(`🎲 Número: *${n}*`) }
  }
}
