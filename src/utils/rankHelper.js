'use strict'

// CORREÇÃO: Agora ele puxa o helpers do local correto (mesma pasta)
const { cleanNumber } = require('./helpers')

function getMentionJid(m) {
  if (!m) return null
  if (typeof m === 'string') return m
  return m.phoneNumber || m.id || m.jid || m.participant || null
}

function fromContactEntry(c) {
  if (!c || typeof c !== 'object') return null
  const n =
    c.name ||
    c.notify ||
    c.verifiedName ||
    c.pushname ||
    c.pushName ||
    c.vname ||
    (c.contact && (c.contact.name || c.contact.notify))
  if (n && String(n).trim().length >= 1) return String(n).trim().slice(0, 20)
  return null
}

function lookupContacts(jid, contacts) {
  if (!jid || !contacts) return null
  const keys = [
    jid,
    String(jid).split('@')[0],
    cleanNumber(jid),
    cleanNumber(jid) ? `${cleanNumber(jid)}@s.whatsapp.net` : null
  ].filter(Boolean)

  for (const k of keys) {
    const hit = fromContactEntry(contacts[k])
    if (hit) return hit
  }

  try {
    const target = cleanNumber(jid)
    const user = String(jid).split('@')[0]
    for (const [k, v] of Object.entries(contacts)) {
      if (!v) continue
      const kn = cleanNumber(k)
      if ((target && kn === target) || String(k).includes(user)) {
        const hit = fromContactEntry(v)
        if (hit) return hit
      }
    }
  } catch {}

  return null
}

function resolveName(m, jid, contacts) {
  if (m && typeof m === 'object') {
    const hit = fromContactEntry(m)
    if (hit) return hit
  }

  const fromStore = lookupContacts(jid, contacts)
  if (fromStore) return fromStore

  if (m && m.phoneNumber) {
    const hit = lookupContacts(m.phoneNumber, contacts)
    if (hit) return hit
  }

  if (!jid) return 'Membro'
  const user = String(jid).split('@')[0]
  if (/^\d{10,}$/.test(user)) return user.slice(-4)
  if (user.length > 14) return 'Membro'
  return user.slice(0, 14)
}

function medal(i) {
  return ['🥇', '🥈', '🥉', '4️⃣', '5️⃣'][i] || `${i + 1}.`
}

function collectContacts(client, sock) {
  const maps = []
  try {
    if (client?.contacts) maps.push(client.contacts)
    if (sock?.contacts) maps.push(sock.contacts)
    if (client?.store?.contacts) maps.push(client.store.contacts)
    if (sock?.store?.contacts) maps.push(sock.store.contacts)
  } catch {}
  const out = {}
  for (const m of maps) {
    if (m && typeof m === 'object') Object.assign(out, m)
  }
  return out
}

function pickRank(participants, { botNum, size = 5, minPct = 60, maxPct = 100, contacts, nameMap } = {}) {
  const pool = []

  for (const m of participants) {
    const jid = getMentionJid(m)
    if (!jid) continue
    if (botNum && cleanNumber(jid) === botNum) continue
    pool.push({ jid, raw: m })
  }

  const picked = [...pool].sort(() => Math.random() - 0.5).slice(0, Math.min(size, pool.length))

  const items = picked
    .map(({ jid, raw }) => {
      let name =
        (nameMap && (nameMap[jid] || nameMap[cleanNumber(jid)])) ||
        resolveName(raw, jid, contacts)

      if ((!name || /^\d+$/.test(name)) && raw?.phoneNumber) {
        name = resolveName(raw, raw.phoneNumber, contacts) || name
      }

      return {
        jid,
        name: name || 'Membro',
        percent: Math.floor(Math.random() * (maxPct - minPct + 1)) + minPct
      }
    })
    .sort((a, b) => b.percent - a.percent)

  return items
}

async function resolveNamesAsync(sock, jids = []) {
  const map = {}
  if (!sock || !jids.length) return map

  for (const jid of jids) {
    try {
      if (typeof sock.onWhatsApp === 'function') {
        const r = await sock.onWhatsApp(jid)
        const row = Array.isArray(r) ? r[0] : r
        if (row?.jid) {
          const contacts = collectContacts(sock, sock)
          const n = lookupContacts(row.jid, contacts)
          if (n) map[jid] = n
        }
      }
    } catch {}
  }
  return map
}

module.exports = {
  getMentionJid,
  resolveName,
  medal,
  pickRank,
  collectContacts,
  resolveNamesAsync,
  lookupContacts
}
