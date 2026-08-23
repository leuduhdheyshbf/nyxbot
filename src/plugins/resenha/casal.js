const fs = require('fs')
const { drawShip } = require('../../modules/games/imageBoard')
const { safeUnlink } = require('../../utils/helpers')
module.exports = {
  name: 'casal',
  description: 'Forma um casal aleatório do grupo',
  category: 'resenha',
  aliases: ['par'],
  async execute({ client, from, info, reply, reagir, isGroup, groupMembers }) {
    if (!isGroup) return reply('❌ Só em grupos.')
    const members = (groupMembers || []).map(m => m.id || m).filter(Boolean)
    if (members.length < 2) return reply('❌ Grupo pequeno.')
    await reagir('💑')
    let a = members[Math.floor(Math.random() * members.length)]
    let b = members[Math.floor(Math.random() * members.length)]
    while (b === a) b = members[Math.floor(Math.random() * members.length)]
    const n1 = '@' + a.split('@')[0]
    const n2 = '@' + b.split('@')[0]
    const pct = Math.floor(Math.random() * 101)
    try {
      const img = await drawShip({ p1: n1, p2: n2, percent: pct })
      await client.sendMessage(from, {
        image: fs.readFileSync(img),
        caption: `💑 *Casal do momento*\n${n1} ❤️ ${n2}`,
        mentions: [a, b]
      }, { quoted: info })
      safeUnlink(img)
    } catch {
      await client.sendMessage(from, { text: `💑 *Casal*\n${n1} ❤️ ${n2}`, mentions: [a, b] }, { quoted: info })
    }
  }
}
