'use strict'

const fs = require('fs')
const { drawRank } = require('../../modules/games/imageBoard')
const { safeUnlink, cleanNumber } = require('../../utils/helpers')

function getMentionJid(m) {
  if (!m) return null
  if (typeof m === 'string') return m
  return m.phoneNumber || m.id || m.jid || null
}

function medal(i) {
  return ['🥇', '🥈', '🥉', '4️⃣', '5️⃣'][i] || `${i + 1}.`
}

module.exports = {
  name: 'rankcorno',
  description: 'Ranking TOP CORNOS do grupo',
  category: 'resenha',
  aliases: ['corno', 'topcorno'],
  cooldown: 5,

  async execute({ client, from, info, reply, reagir, isGroup, groupMembers, sock, groupMetadata }) {
    if (!isGroup) return reply('❌ Só funciona em *grupos*.')

    let participants = Array.isArray(groupMembers) ? groupMembers : []
    if (participants.length < 3 && groupMetadata?.participants) {
      participants = groupMetadata.participants
    }
    if (participants.length < 3) return reply('❌ Grupo muito pequeno.')

    await reagir('🤡')

    const botNum = cleanNumber(client?.user?.id || sock?.user?.id)
    const pool = []
    for (const m of participants) {
      const jid = getMentionJid(m)
      if (!jid) continue
      if (botNum && cleanNumber(jid) === botNum) continue
      pool.push(jid)
    }
    if (pool.length < 3) return reply('❌ Membros insuficientes.')

    const picked = [...pool].sort(() => Math.random() - 0.5).slice(0, Math.min(5, pool.length))
    const items = picked
      .map((jid) => ({
        jid,
        percent: Math.floor(Math.random() * 41) + 60
      }))
      .sort((a, b) => b.percent - a.percent)

    // Imagem limpa: Top 1..5 | Legenda: @menções (nome real no WhatsApp)
    const rankItems = items.map((it, i) => ({
      name: 'Top ' + (i + 1),
      value: it.percent + '%'
    }))

    let caption = '🤡 *TOP CORNOS DO GRUPO*\n'
    caption += '━━━━━━━━━━━━━━━━━━\n\n'
    items.forEach((it, i) => {
      caption += medal(i) + ' @' + String(it.jid).split('@')[0] + ' — *' + it.percent + '%*\n'
    })
    caption += '\n━━━━━━━━━━━━━━━━━━\n_Ranking 100% científico_ 🧪'

    const mentions = items.map((it) => it.jid)

    try {
      const img = await drawRank({ title: 'TOP CORNOS', emoji: '🤡', items: rankItems })
      await client.sendMessage(
        from,
        { image: fs.readFileSync(img), caption, mentions },
        { quoted: info }
      )
      safeUnlink(img)
    } catch (e) {
      console.error('[rankcorno]', e.message)
      await client.sendMessage(from, { text: caption, mentions }, { quoted: info })
    }
  }
}
