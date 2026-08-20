'use strict'
const fs = require('fs')
const { drawRank } = require('../../modules/games/imageBoard')
const { safeUnlink, cleanNumber } = require('../../utils/helpers')
const { pickRank, medal, collectContacts } = require('../../utils/rankHelper')
module.exports = {
  name: 'rankgelado',
  description: 'Ranking TOP GELADOS',
  category: 'resenha',
  aliases: ["gelado"],
  cooldown: 5,
  async execute({ client, from, info, reply, reagir, isGroup, groupMembers, sock, groupMetadata }) {
    if (!isGroup) return reply('❌ Só em grupos.')
    let participants = Array.isArray(groupMembers) ? groupMembers : []
    if (participants.length < 3 && groupMetadata?.participants) participants = groupMetadata.participants
    if (participants.length < 3) return reply('❌ Grupo pequeno.')
    await reagir('🧊')
    const botNum = cleanNumber(client?.user?.id || sock?.user?.id)
    const contacts = collectContacts(client, sock)
    const items = pickRank(participants, { botNum, size: 5, contacts })
    if (items.length < 3) return reply('❌ Membros insuficientes.')
    const rankItems = items.map((it) => ({ name: it.name, value: it.percent + '%', percent: it.percent }))
    let caption = '🧊 *TOP GELADOS*\n\n'
    items.forEach((it, i) => { caption += medal(i) + ' @' + String(it.jid).split('@')[0] + ' — *' + it.percent + '*%\n' })
    const mentions = items.map((it) => it.jid)
    try {
      const img = await drawRank({ title: 'TOP GELADOS', emoji: '🧊', items: rankItems })
      await client.sendMessage(from, { image: fs.readFileSync(img), caption, mentions }, { quoted: info })
      safeUnlink(img)
    } catch (e) {
      await client.sendMessage(from, { text: caption, mentions }, { quoted: info })
    }
  }
}
