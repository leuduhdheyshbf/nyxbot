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
  name: 'ranklindo',
  description: 'Ranking TOP LINDOS do grupo',
  category: 'resenha',
  aliases: ['lindo', 'toplindo'],
  cooldown: 5,

  async execute({ client, from, info, reply, reagir, isGroup, groupMembers, sock, groupMetadata }) {
    if (!isGroup) return reply('❌ Só funciona em *grupos*.')

    let participants = Array.isArray(groupMembers) ? groupMembers : []
    if (participants.length < 3 && groupMetadata?.participants) {
      participants = groupMetadata.participants
    }
    if (participants.length < 3) return reply('❌ Grupo muito pequeno.')

    await reagir('😍')

    const botNum = cleanNumber(client?.user?.id || sock?.user?.id)
    const pool = []
    for (const m of participants) {
      const jid = getMentionJid(m)
      if (!jid) continue
      if (botNum && cleanNumber(jid) === botNum) continue
      pool.push(jid)
    }
    if (pool.length < 3) return reply('❌ Membros insuficientes.')

    // sorteia 5 → gera % → ORDENA maior para menor
    const picked = [...pool].sort(() => Math.random() - 0.5).slice(0, Math.min(5, pool.length))
    const items = picked
      .map((jid) => ({
        jid,
        percent: Math.floor(Math.random() * 41) + 60
      }))
      .sort((a, b) => b.percent - a.percent)

    // imagem: só posição + barra + % (sem LID feio)
    const rankItems = items.map((it, i) => ({
      name: i === 0 ? '1º lugar' : i === 1 ? '2º lugar' : i === 2 ? '3º lugar' : `${i + 1}º lugar`,
      value: it.percent + '%'
    }))

    // legenda: menções (WhatsApp mostra o nome real)
    let caption = '😍 *TOP LINDOS DO GRUPO*\n'
    caption += '━━━━━━━━━━━━━━━━━━\n\n'
    items.forEach((it, i) => {
      caption += `${medal(i)} @${String(it.jid).split('@')[0]} — *${it.percent}%*\n`
    })
    caption += '\n━━━━━━━━━━━━━━━━━━\n_Ranking 100% científico_ 🧪'

    try {
      const img = await drawRank({ title: 'TOP LINDOS', emoji: '😍', items: rankItems })
      await client.sendMessage(
        from,
        {
          image: fs.readFileSync(img),
          caption,
          mentions: items.map((it) => it.jid)
        },
        { quoted: info }
      )
      safeUnlink(img)
    } catch (e) {
      console.error('[ranklindo]', e.message)
      await client.sendMessage(
        from,
        { text: caption, mentions: items.map((it) => it.jid) },
        { quoted: info }
      )
    }
  }
}
