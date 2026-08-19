const fs = require('fs')
const { drawRank } = require('../../modules/games/imageBoard')
const { safeUnlink } = require('../../utils/helpers')

module.exports = {
  name: 'ranklindo',
  description: 'Ranking TOP LINDOS do grupo',
  category: 'resenha',
  aliases: [],
  async execute({ client, from, info, reply, reagir, isGroup, groupMembers }) {
    if (!isGroup) return reply('❌ Só em grupos.')
    const members = (groupMembers || []).map(m => m.id || m).filter(Boolean)
    if (members.length < 3) return reply('❌ Grupo pequeno.')
    await reagir('😍')
    const shuffled = [...members].sort(() => Math.random() - 0.5).slice(0, 5)
    const items = shuffled.map((id) => ({
      name: '@' + id.split('@')[0],
      value: (Math.floor(Math.random() * 40) + 60) + '%'
    }))
    try {
      const img = await drawRank({ title: 'TOP LINDOS', emoji: '😍', items })
      let caption = '😍 *TOP LINDOS DO GRUPO*\n\n'
      items.forEach((it, i) => { caption += (i + 1) + '. ' + it.name + ' — ' + it.value + '\n' })
      await client.sendMessage(from, {
        image: fs.readFileSync(img),
        caption,
        mentions: shuffled
      }, { quoted: info })
      safeUnlink(img)
    } catch (e) {
      reply('❌ Erro no rank: ' + e.message)
    }
  }
}
