'use strict'

const { cleanNumber } = require('./helpers')

function getMentionJid(m) {
  if (!m) return null
  if (typeof m === 'string') return m
  return m.phoneNumber || m.id || m.jid || m.participant || null
}

function resolveName(m, jid, contacts) {
  if (m && typeof m === 'object') {
    const n =
      m.name ||
      m.notify ||
      m.verifiedName ||
      m.pushName ||
      (m.contact && (m.contact.name || m.contact.notify))
    if (n && String(n).trim().length >= 2) return String(n).trim().slice(0, 20)
  }
  if (contacts && jid) {
    const c = contacts[jid] || contacts[String(jid).split('@')[0]]
    if (c) {
      const n = c.name || c.notify || c.verifiedName || c.pushname
      if (n && String(n).trim().length >= 2) return String(n).trim().slice(0, 20)
    }
  }
  if (!jid) return 'Membro'
  const user = String(jid).split('@')[0]
  if (/^\d{8,}$/.test(user)) return '…' + user.slice(-4)
  // LID / outros ids
  if (user.length > 12) return 'Membro'
  return user.slice(0, 16)
}

function medal(i) {
  return ['🥇', '🥈', '🥉', '4️⃣', '5️⃣'][i] || `${i + 1}.`
}

/**
 * Monta ranking aleatório com nomes
 * @param {object} opts.contacts - sock.contacts (opcional)
 */
function pickRank(participants, { botNum, size = 5, minPct = 60, maxPct = 100, contacts } = {}) {
  const pool = []

  for (const m of participants) {
    const jid = getMentionJid(m)
    if (!jid) continue
    if (botNum && cleanNumber(jid) === botNum) continue
    pool.push({ jid, raw: m })
  }

  const picked = [...pool].sort(() => Math.random() - 0.5).slice(0, Math.min(size, pool.length))
  const items = picked
    .map(({ jid, raw }) => ({
      jid,
      name: resolveName(raw, jid, contacts),
      percent: Math.floor(Math.random() * (maxPct - minPct + 1)) + minPct
    }))
    .sort((a, b) => b.percent - a.percent)

  return items
}

module.exports = {
  getMentionJid,
  resolveName,
  medal,
  pickRank
}
