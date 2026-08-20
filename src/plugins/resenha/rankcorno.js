'use strict'

const fs = require('fs')
const { drawRank } = require('../../modules/games/imageBoard')
const { safeUnlink, cleanNumber } = require('../../utils/helpers')

function getJid(m) {
  if (!m) return null
  if (typeof m === 'string') return m
  return m.phoneNumber || m.id || m.jid || null
}
function getMentionJid(m) {
  if (!m) return null
  if (typeof m === 'string') return m
  return m.phoneNumber || m.id || m.jid || null
}
function prettyId(jid) {
  const raw = String(jid || '').split('@')[0].split(':')[0].replace(/\D/g, '')
  if (!raw) return '???'
  if (raw.startsWith('55') && (raw.length === 12 || raw.length === 13)) {
    const ddd = raw.slice(2, 4)
    const rest = raw.slice(4)
    if (rest.length === 9) return `(${ddd}) ${rest.slice(0, 5)}-${rest.slice(5)}`
    if (rest.length === 8) return `(${ddd}) ${rest.slice(0, 4)}-${rest.slice(4)}`
  }
  if (raw.length >= 10 && raw.length <= 13) return raw.slice(0, 2) + '…' + raw.slice(-4)
  if (raw.length > 12) return '…' + raw.slice(-5)
  return raw
}
function displayName(m, jid) {
  if (m && typeof m === 'object') {
    const n = m.name || m.notify || m.verifiedName || m.pushName || m.pushname
    if (n && String(n).trim() && !/^\d+$/.test(String(n).trim())) {
      return String(n).trim().slice(0, 22)
    }
  }
  return prettyId(jid)
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
    if ((!participants.length || participants.length < 3) && groupMetadata?.participants) {
      participants = groupMetadata.participants
    }
    if (participants.length < 3) return reply('❌ Grupo muito pequeno (mín. 3 membros).')

    await reagir('🤡')
    const botNum = cleanNumber(client?.user?.id || sock?.user?.id)
    const pool = []
    for (const m of participants) {
      const jid = getJid(m)
      if (!jid) continue
      if (botNum && cleanNumber(jid) === botNum) continue
      if (botNum && m?.phoneNumber && cleanNumber(m.phoneNumber) === botNum) continue
      pool.push({ jid, mention: getMentionJid(m), member: m })
    }
    if (pool.length < 3) return reply('❌ Não achei membros suficientes.')

    const picked = [...pool].sort(() => Math.random() - 0.5).slice(0, Math.min(5, pool.length))
    const items = picked
      .map(({ jid, mention, member }) => ({
        jid,
        mention: mention || jid,
        name: displayName(member, jid),
        percent: Math.floor(Math.random() * 41) + 60
      }))
      .sort((a, b) => b.percent - a.percent || a.name.localeCompare(b.name))

    const rankItems = items.map((it) => ({ name: it.name, value: it.percent + '%' }))

    let caption = '🤡 *TOP CORNOS DO GRUPO*\n'
    caption += '━━━━━━━━━━━━━━━━━━\n\n'
    items.forEach((it, i) => {
      const tag = '@' + String(it.mention).split('@')[0]
      caption += `${medal(i)} ${tag} — *${it.percent}%*\n`
    })
    caption += '\n━━━━━━━━━━━━━━━━━━\n'
    caption += '_Ranking 100% científico_ 🧪✨'

    const mentions = items.map((it) => it.mention).filter(Boolean)
    try {
      const img = await drawRank({ title: 'TOP CORNOS', emoji: '🤡', items: rankItems })
      await client.sendMessage(from, { image: fs.readFileSync(img), caption, mentions }, { quoted: info })
      safeUnlink(img)
    } catch (e) {
      console.error('[rankcorno]', e.message)
      await client.sendMessage(from, { text: caption, mentions }, { quoted: info })
    }
  }
}
