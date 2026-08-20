'use strict'

const fs = require('fs')
const { drawRank } = require('../../modules/games/imageBoard')
const { safeUnlink, cleanNumber } = require('../../utils/helpers')
const { pickRank, medal } = require('../../utils/rankHelper')

module.exports = {
  name: 'rankforte',
  description: 'Ranking TOP FORTES do grupo',
  category: 'resenha',
  aliases: ['forte', 'topforte'],
  cooldown: 5,

  async execute({ client, from, info, reply, reagir, isGroup, groupMembers, sock, groupMetadata }) {
    if (!isGroup) return reply('❌ Só funciona em *grupos*.')

    let participants = Array.isArray(groupMembers) ? groupMembers : []
    if (participants.length < 3 && groupMetadata?.participants) {
      participants = groupMetadata.participants
    }
    if (participants.length < 3) return reply('❌ Grupo muito pequeno.')

    await reagir('💪')

    const botNum = cleanNumber(client?.user?.id || sock?.user?.id)
    const contacts = client?.contacts || sock?.contacts || {}
    const items = pickRank(participants, { botNum, size: 5, contacts })
    if (items.length < 3) return reply('❌ Membros insuficientes.')

    const rankItems = items.map((it) => ({
      name: it.name,
      value: it.percent + '%',
      percent: it.percent
    }))

    let caption = '💪 *TOP FORTES DO GRUPO*\n\n'
    caption += '━━━━━━━━━━━━━━━━━━\n\n'
    items.forEach((it, i) => {
      caption += medal(i) + ' @' + String(it.jid).split('@')[0] + ' — *' + it.percent + '%*\n'
    })
    caption += '\n━━━━━━━━━━━━━━━━━━\n_Ranking 100% científico_ 🧪'

    const mentions = items.map((it) => it.jid)

    try {
      const img = await drawRank({ title: 'TOP FORTES', emoji: '💪', items: rankItems })
      await client.sendMessage(
        from,
        { image: fs.readFileSync(img), caption, mentions },
        { quoted: info }
      )
      safeUnlink(img)
    } catch (e) {
      console.error('[rankforte]', e.message)
      await client.sendMessage(from, { text: caption, mentions }, { quoted: info })
    }
  }
}
