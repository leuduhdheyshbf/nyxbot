const fs = require('fs')
const { drawQuote } = require('../../modules/games/imageBoard')
const { safeUnlink } = require('../../utils/helpers')
module.exports = {
  name: 'escolha',
  description: 'Escolhe entre opções',
  category: 'resenha',
  aliases: ['choose', 'ou'],
  async execute({ client, from, info, reply, reagir, q, args }) {
    const raw = q || args.join(' ')
    if (!raw || !raw.includes(' ou ')) return reply('❗ Use: .escolha opção1 ou opção2')
    await reagir('🎯')
    const opts = raw.split(/\s+ou\s+/i).map(s => s.trim()).filter(Boolean)
    const pick = opts[Math.floor(Math.random() * opts.length)]
    try {
      const img = await drawQuote({ title: 'Escolha', emoji: '🎯', text: pick })
      await client.sendMessage(from, { image: fs.readFileSync(img), caption: `🎯 Eu escolho: *${pick}*` }, { quoted: info })
      safeUnlink(img)
    } catch { await reply(`🎯 Eu escolho: *${pick}*`) }
  }
}
