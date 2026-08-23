const fs = require('fs')
const { drawMeter } = require('../../modules/games/imageBoard')
const { safeUnlink } = require('../../utils/helpers')
module.exports = {
  name: 'chance',
  description: 'Chance de algo acontecer',
  category: 'resenha',
  aliases: ['probabilidade'],
  async execute({ client, from, info, reply, reagir, q }) {
    if (!q) return reply('❗ Use: .chance [algo]')
    await reagir('🎲')
    const pct = Math.floor(Math.random() * 101)
    try {
      const img = await drawMeter({ title: 'Chance', emoji: '🎲', name: q.slice(0, 40), percent: pct })
      await client.sendMessage(from, { image: fs.readFileSync(img), caption: `🎲 Chance de *${q}*: *${pct}%*` }, { quoted: info })
      safeUnlink(img)
    } catch { await reply(`🎲 Chance de *${q}*: *${pct}%*`) }
  }
}
