const fs = require('fs')
const { drawRank } = require('../../modules/games/imageBoard')
const { safeUnlink } = require('../../utils/helpers')
module.exports = {
  name: 'top10',
  description: 'Top 10 do grupo (aleatório)',
  category: 'resenha',
  aliases: ['ranking', 'top'],
  async execute({ client, from, info, reply, reagir, isGroup, groupMembers }) {
    if (!isGroup) return reply('❌ Só em grupos.')
    const members = (groupMembers || []).map(m => m.id || m.jid || m).filter(Boolean)
    if (members.length < 3) return reply('❌ Grupo pequeno.')
    await reagir('🏆')
    const shuffled = [...members].sort(() => Math.random() - 0.5).slice(0, 10)
    const items = shuffled.map((id, i) => ({ name: '@' + String(id).split('@')[0], value: `#${i + 1}` }))
    try {
      const img = await drawRank({ title: 'TOP 10 DO GRUPO', emoji: '🏆', items })
      let caption = '🏆 *TOP 10 DO GRUPO*\n\n'
      items.forEach((it, i) => { caption += `${i + 1}. ${it.name}\n` })
      await client.sendMessage(from, { image: fs.readFileSync(img), caption, mentions: shuffled }, { quoted: info })
      safeUnlink(img)
    } catch (e) {
      reply('❌ Erro: ' + e.message)
    }
  }
}
