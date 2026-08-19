const fs = require('fs')
const { drawQuote } = require('../../modules/games/imageBoard')
const { safeUnlink } = require('../../utils/helpers')
module.exports = {
  name: 'sorteio',
  description: 'Sorteia alguém do grupo ou entre nomes',
  category: 'resenha',
  aliases: ['sortear'],
  async execute({ client, from, info, reply, reagir, isGroup, groupMembers, args }) {
    await reagir('🎰')
    let winner, mentions = []
    if (args.length >= 2) {
      winner = args[Math.floor(Math.random() * args.length)]
    } else if (isGroup && groupMembers?.length) {
      const members = groupMembers.map(m => m.id || m).filter(Boolean)
      winner = members[Math.floor(Math.random() * members.length)]
      mentions = [winner]
      winner = '@' + String(winner).split('@')[0]
    } else {
      return reply('❗ Use em grupo ou: .sorteio nome1 nome2 ...')
    }
    try {
      const img = await drawQuote({ title: 'Sorteio', emoji: '🎰', text: String(winner) })
      const payload = { image: fs.readFileSync(img), caption: `🎰 Sorteado: *${winner}*` }
      if (mentions.length) payload.mentions = mentions
      await client.sendMessage(from, payload, { quoted: info })
      safeUnlink(img)
    } catch { await reply(`🎰 Sorteado: *${winner}*`) }
  }
}
