'use strict'

const fs = require('fs')
const { drawRank } = require('../../modules/games/imageBoard')
const { safeUnlink, cleanNumber } = require('../../utils/helpers')

function getMentionJid(m) {
  if (!m) return null
  if (typeof m === 'string') return m
  return m.phoneNumber || m.id || m.jid || null
}

function labelFor(m, jid) {
  if (m && typeof m === 'object') {
    const n = m.name || m.notify || m.verifiedName || m.pushName || m.pushname
    if (n && String(n).trim() && !/^\d+$/.test(String(n).trim())) {
      return String(n).trim().slice(0, 18)
    }
  }
  const raw = String(jid || '').split('@')[0].split(':')[0].replace(/\D/g, '')
  if (raw.startsWith('55') && raw.length >= 12) {
    const ddd = raw.slice(2, 4)
    const rest = raw.slice(4)
    if (rest.length === 9) return `(${ddd}) ${rest.slice(0, 5)}-${rest.slice(5)}`
    if (rest.length === 8) return `(${ddd}) ${rest.slice(0, 4)}-${rest.slice(4)}`
  }
  if (raw.length >= 10 && raw.length <= 13) return raw.slice(0, 4) + '…' + raw.slice(-4)
  if (raw.length > 8) return '…' + raw.slice(-6)
  return raw || '?'
}

function medal(i) {
  return ['🥇', '🥈', '🥉', '4️⃣', '5️⃣'][i] || `${i + 1}.`
}

module.exports = {
  name: 'rankburro',
  description: 'Ranking TOP BURROS do grupo',
  category: 'resenha',
  aliases: ['burro', 'topburro'],
  cooldown: 5,

  async execute({ client, from, info, reply, reagir, isGroup, groupMembers, sock, groupMetadata }) {
    if (!isGroup) return reply('❌ Só funciona em *grupos*.')

    let participants = Array.isArray(groupMembers) ? groupMembers : []
    if (participants.length < 3 && groupMetadata?.participants) {
      participants = groupMetadata.participants
    }
    if (participants.length < 3) return reply('❌ Grupo muito pequeno.')

    await reagir('🫏')

    const botNum = cleanNumber(client?.user?.id || sock?.user?.id)
    const pool = []
    for (const m of participants) {
      const jid = getMentionJid(m)
      if (!jid) continue
      if (botNum && cleanNumber(jid) === botNum) continue
      pool.push({ jid, member: m })
    }
    if (pool.length < 3) return reply('❌ Membros insuficientes.')

    const picked = [...pool].sort(() => Math.random() - 0.5).slice(0, Math.min(5, pool.length))
    const items = picked
      .map(({ jid, member }) => ({
        jid,
        name: labelFor(member, jid),
        percent: Math.floor(Math.random() * 41) + 60
      }))
      .sort((a, b) => b.percent - a.percent)

    const rankItems = items.map((it) => ({ name: it.name, value: it.percent + '%' }))

    let caption = '🫏 *TOP BURROS DO GRUPO*\n━━━━━━━━━━━━━━━━━━\n\n'
    items.forEach((it, i) => {
      caption += `${medal(i)} @${String(it.jid).split('@')[0]} — *${it.percent}%*\n`
    })
    caption += '\n━━━━━━━━━━━━━━━━━━\n_Ranking 100% científico_ 🧪'

    const mentions = items.map((it) => it.jid)

    try {
      const img = await drawRank({ title: 'TOP BURROS', emoji: '🫏', items: rankItems })
      await client.sendMessage(
        from,
        { image: fs.readFileSync(img), caption, mentions },
        { quoted: info }
      )
      safeUnlink(img)
    } catch (e) {
      console.error('[rankburro]', e.message)
      await client.sendMessage(from, { text: caption, mentions }, { quoted: info })
    }
  }
}
