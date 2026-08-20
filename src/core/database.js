'use strict'

/**
 * Database Nyx Bot V2 — Supabase completo
 *
 * Tabelas Supabase:
 *   users, premium_users, donos, bot_features,
 *   warns, mutes, afk, group_prefixes, active_groups
 *
 * getUser/saveUser e isPremium continuam síncronos (cache).
 */

const fs = require('fs')
const path = require('path')
const { ensureDir } = require('../utils/helpers')
const { CyanLog, RedLog, YellowLog } = require('./logger')
const { createClient } = require('@supabase/supabase-js')

const supabaseUrl = process.env.SUPABASE_URL || 'https://nzcdwfktdtvfxtfsapon.supabase.co'
const supabaseKey =
  process.env.SUPABASE_SERVICE_KEY ||
  process.env.SUPABASE_ANON_KEY ||
  'sb_publishable_jmFRjEk6sWWNy6JoNVLM0Q_dNhrnu2T'

const supabase = createClient(supabaseUrl, supabaseKey)
const USE_SUPABASE = process.env.USE_SUPABASE_USERS !== '0'

const ROOT = path.join(__dirname, '..', '..')
const DB_DIR = path.join(ROOT, 'database', 'json')
const BACKUP_DIR = path.join(ROOT, 'database', 'backups')
ensureDir(DB_DIR)
ensureDir(BACKUP_DIR)

// ---------- JSON fallback (só se Supabase off) ----------
const DEFAULTS = {
  users: {},
  premium: { users: [] },
  features: {
    antidelete: true,
    viewonce: true,
    antilink: false,
    antiflood: false
  },
  mutes: {},
  warns: {},
  afk: {},
  autoreply: {},
  badwords: { enabled: {}, words: [] },
  achievements: {},
  prefixos_grupo: {},
  economy: {},
  levels: {}
}

const store = {}
const dirtyJson = new Set()
let flushTimer = null

function filePath(name) {
  return path.join(DB_DIR, `${name}.json`)
}

function load(name) {
  if (store[name]) return store[name]
  const fp = filePath(name)
  try {
    if (fs.existsSync(fp)) {
      store[name] = JSON.parse(fs.readFileSync(fp, 'utf8'))
    } else {
      store[name] = JSON.parse(JSON.stringify(DEFAULTS[name] ?? {}))
      fs.writeFileSync(fp, JSON.stringify(store[name], null, 2))
    }
  } catch (e) {
    RedLog(`DB load ${name}: ${e.message}`)
    store[name] = JSON.parse(JSON.stringify(DEFAULTS[name] ?? {}))
  }
  return store[name]
}

function markDirty(name) {
  dirtyJson.add(name)
  scheduleFlush()
}

function flushJson() {
  for (const name of dirtyJson) {
    try {
      fs.writeFileSync(filePath(name), JSON.stringify(store[name], null, 2))
    } catch (e) {
      RedLog(`DB save ${name}: ${e.message}`)
    }
  }
  dirtyJson.clear()
}

function backup(name) {
  try {
    const src = filePath(name)
    if (!fs.existsSync(src)) return
    fs.copyFileSync(src, path.join(BACKUP_DIR, `${name}-${Date.now()}.json`))
  } catch (e) {
    RedLog(`Backup ${name}: ${e.message}`)
  }
}

// ---------- Caches Supabase ----------
const userCache = new Map()
const userDirty = new Set()
const premiumSet = new Set() // jids premium
const donosSet = new Set()
const featuresCache = { ...DEFAULTS.features }
const prefixCache = new Map() // groupId → prefix
const afkCache = new Map() // jid → { reason, since }
const mutesCache = new Map() // `${groupId}:${userJid}` → row
const warnsCache = new Map() // groupId → array of warns (lazy)

let hydrated = false

function defaultUser(jid) {
  return {
    jid,
    nome: '',
    coins: 0,
    xp: 0,
    level: 1,
    daily: 0,
    wins: 0,
    losses: 0,
    achievements: [],
    inventory: [],
    spouse: null,
    marriedAt: null,
    createdAt: Date.now()
  }
}

function rowToUser(row) {
  if (!row) return null
  return {
    jid: row.jid,
    nome: row.nome || '',
    coins: row.coins ?? 0,
    xp: row.xp ?? 0,
    level: row.level ?? 1,
    daily: row.daily ?? 0,
    wins: row.wins ?? 0,
    losses: row.losses ?? 0,
    achievements: row.achievements || [],
    inventory: row.inventory || [],
    spouse: row.spouse || null,
    marriedAt: row.married_at || null,
    createdAt: row.created_at || Date.now()
  }
}

function userToRow(u) {
  return {
    jid: u.jid,
    nome: u.nome || '',
    coins: u.coins ?? 0,
    xp: u.xp ?? 0,
    level: u.level ?? 1,
    daily: u.daily ?? 0,
    wins: u.wins ?? 0,
    losses: u.losses ?? 0,
    achievements: u.achievements || [],
    inventory: u.inventory || [],
    spouse: u.spouse || null,
    married_at: u.marriedAt || null,
    created_at: u.createdAt || Date.now()
  }
}

function scheduleFlush() {
  if (!flushTimer) flushTimer = setTimeout(flush, 2000)
}

async function hydrateAll() {
  if (!USE_SUPABASE || hydrated) return
  try {
    const [usersR, premR, donosR, featR, prefR, afkR, mutesR] = await Promise.all([
      supabase.from('users').select('*'),
      supabase.from('premium_users').select('jid'),
      supabase.from('donos').select('jid'),
      supabase.from('bot_features').select('*'),
      supabase.from('group_prefixes').select('*'),
      supabase.from('afk').select('*'),
      supabase.from('mutes').select('*')
    ])

    if (usersR.data) {
      for (const row of usersR.data) {
        const u = rowToUser(row)
        if (u?.jid) userCache.set(u.jid, u)
      }
    }
    if (premR.data) {
      premiumSet.clear()
      for (const r of premR.data) if (r.jid) premiumSet.add(r.jid)
    }
    if (donosR.data) {
      donosSet.clear()
      for (const r of donosR.data) if (r.jid) donosSet.add(r.jid)
    }
    if (featR.data) {
      for (const r of featR.data) {
        featuresCache[r.key] = !!r.value
        // group:<groupId>:<featureKey>
        if (typeof r.key === 'string' && r.key.startsWith('group:')) {
          const parts = r.key.split(':')
          if (parts.length >= 3) {
            const gid = parts[1]
            const fkey = parts.slice(2).join(':')
            if (!featuresCache.groupFeatures) featuresCache.groupFeatures = {}
            if (!featuresCache.groupFeatures[gid]) featuresCache.groupFeatures[gid] = {}
            featuresCache.groupFeatures[gid][fkey] = !!r.value
          }
        }
      }
    }
    if (prefR.data) {
      for (const r of prefR.data) prefixCache.set(r.group_id, r.prefix)
    }
    if (afkR.data) {
      for (const r of afkR.data) afkCache.set(r.jid, { reason: r.reason || '', since: r.since })
    }
    if (mutesR.data) {
      for (const r of mutesR.data) {
        mutesCache.set(`${r.group_id}:${r.user_jid}`, r)
      }
    }

    hydrated = true
    CyanLog(
      `☁️  Supabase: users=${userCache.size} premium=${premiumSet.size} donos=${donosSet.size}`
    )
  } catch (e) {
    RedLog(`[Supabase] hydrate: ${e.message}`)
  }
}

async function flushUsersSupabase() {
  if (!userDirty.size) return
  const jids = [...userDirty]
  userDirty.clear()
  const rows = jids.map((j) => userCache.get(j)).filter(Boolean).map(userToRow)
  if (!rows.length) return
  const { error } = await supabase.from('users').upsert(rows, { onConflict: 'jid' })
  if (error) {
    RedLog(`[Supabase] users flush: ${error.message}`)
    for (const j of jids) userDirty.add(j)
  }
}

function flush() {
  flushTimer = null
  flushJson()
  if (USE_SUPABASE) {
    flushUsersSupabase().catch((e) => RedLog(e.message))
  }
}

// ============================================
// USERS
// ============================================

function getUser(jid) {
  if (!jid) return defaultUser('unknown')

  if (USE_SUPABASE) {
    if (userCache.has(jid)) return userCache.get(jid)
    const u = defaultUser(jid)
    userCache.set(jid, u)
    userDirty.add(jid)
    scheduleFlush()
    // fetch remote em background
    supabase
      .from('users')
      .select('*')
      .eq('jid', jid)
      .maybeSingle()
      .then(({ data }) => {
        if (!data) return
        if (!userDirty.has(jid)) userCache.set(jid, rowToUser(data))
      })
      .catch(() => {})
    return u
  }

  const users = load('users')
  if (!users[jid]) {
    users[jid] = defaultUser(jid)
    markDirty('users')
  }
  return users[jid]
}

function saveUser(jid, data) {
  if (!jid) return
  if (USE_SUPABASE) {
    const cur = userCache.get(jid) || defaultUser(jid)
    userCache.set(jid, { ...cur, ...data, jid })
    userDirty.add(jid)
    scheduleFlush()
    return
  }
  const users = load('users')
  users[jid] = { ...users[jid], ...data, jid }
  markDirty('users')
}

function getAllUsers() {
  if (USE_SUPABASE) return [...userCache.values()]
  return Object.values(load('users'))
}

async function rankTopAsync(limit = 10) {
  if (USE_SUPABASE) {
    await hydrateAll()
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .order('level', { ascending: false })
      .order('xp', { ascending: false })
      .limit(limit)
    if (!error && data) return data.map(rowToUser)
  }
  return getAllUsers()
    .sort((a, b) => (b.level || 1) - (a.level || 1) || (b.xp || 0) - (a.xp || 0))
    .slice(0, limit)
}

// ============================================
// PREMIUM / VIP
// ============================================

function cleanMatch(a, b) {
  const ca = String(a || '').split('@')[0].replace(/\D/g, '')
  const cb = String(b || '').split('@')[0].replace(/\D/g, '')
  return ca && ca === cb
}

function isPremium(jid, donoList = []) {
  if (donoList.some((d) => d === jid || cleanMatch(d, jid))) return true
  if (isDonoExtra(jid)) return true

  if (USE_SUPABASE) {
    if (premiumSet.has(jid)) return true
    // match por número sem @
    for (const p of premiumSet) {
      if (cleanMatch(p, jid)) return true
    }
    return false
  }

  const p = load('premium')
  return (p.users || []).some((u) => u === jid || cleanMatch(u, jid))
}

async function addPremium(jid, meta = {}) {
  if (USE_SUPABASE) {
    premiumSet.add(jid)
    const { error } = await supabase.from('premium_users').upsert(
      {
        jid,
        added_at: Date.now(),
        added_by: meta.by || null,
        expires_at: meta.expiresAt || null,
        note: meta.note || ''
      },
      { onConflict: 'jid' }
    )
    if (error) {
      RedLog(`[Supabase] addPremium: ${error.message}`)
      return false
    }
    return true
  }
  const p = load('premium')
  if (!p.users.includes(jid)) {
    p.users.push(jid)
    markDirty('premium')
    return true
  }
  return false
}

async function removePremium(jid) {
  if (USE_SUPABASE) {
    premiumSet.delete(jid)
    const { error } = await supabase.from('premium_users').delete().eq('jid', jid)
    if (error) {
      RedLog(`[Supabase] removePremium: ${error.message}`)
      return false
    }
    return true
  }
  const p = load('premium')
  const i = p.users.indexOf(jid)
  if (i >= 0) {
    p.users.splice(i, 1)
    markDirty('premium')
    return true
  }
  return false
}

function listPremium() {
  if (USE_SUPABASE) return [...premiumSet]
  return load('premium').users || []
}

// ============================================
// DONOS (extras além do config.json)
// ============================================

function isDonoExtra(jid) {
  if (donosSet.has(jid)) return true
  for (const d of donosSet) {
    if (cleanMatch(d, jid)) return true
  }
  return false
}

async function addDono(jid, nome = '') {
  donosSet.add(jid)
  if (!USE_SUPABASE) return true
  const { error } = await supabase
    .from('donos')
    .upsert({ jid, nome, added_at: Date.now() }, { onConflict: 'jid' })
  if (error) {
    RedLog(`[Supabase] addDono: ${error.message}`)
    return false
  }
  return true
}

async function removeDono(jid) {
  donosSet.delete(jid)
  if (!USE_SUPABASE) return true
  const { error } = await supabase.from('donos').delete().eq('jid', jid)
  if (error) {
    RedLog(`[Supabase] removeDono: ${error.message}`)
    return false
  }
  return true
}

function listDonos() {
  return [...donosSet]
}

// ============================================
// FEATURES
// ============================================

function getFeatures() {
  if (USE_SUPABASE) return { ...featuresCache }
  return load('features')
}

async function setFeature(key, value) {
  featuresCache[key] = !!value
  if (USE_SUPABASE) {
    const { error } = await supabase
      .from('bot_features')
      .upsert({ key, value: !!value }, { onConflict: 'key' })
    if (error) RedLog(`[Supabase] setFeature: ${error.message}`)
    return
  }
  const f = load('features')
  f[key] = !!value
  markDirty('features')
}

/**
 * Feature por grupo (ex: antilink).
 * Estrutura em features.json:
 *   groupFeatures: { [groupId]: { antilink: true, ... } }
 * Fallback: se groupFeatures não existir, usa o flag global legado (feats.antilink).
 */
function getGroupFeature(groupId, key) {
  if (!groupId || !key) return false
  const f = getFeatures() || {}
  const map = f.groupFeatures
  if (map && typeof map === 'object' && map[groupId] && typeof map[groupId] === 'object') {
    if (Object.prototype.hasOwnProperty.call(map[groupId], key)) {
      return !!map[groupId][key]
    }
  }
  // legado: feature global
  return !!f[key]
}

async function setGroupFeature(groupId, key, value) {
  if (!groupId || !key) return
  const f = load('features')
  if (!f.groupFeatures || typeof f.groupFeatures !== 'object') f.groupFeatures = {}
  if (!f.groupFeatures[groupId] || typeof f.groupFeatures[groupId] !== 'object') {
    f.groupFeatures[groupId] = {}
  }
  f.groupFeatures[groupId][key] = !!value
  // espelha no cache em memória
  if (!featuresCache.groupFeatures) featuresCache.groupFeatures = {}
  if (!featuresCache.groupFeatures[groupId]) featuresCache.groupFeatures[groupId] = {}
  featuresCache.groupFeatures[groupId][key] = !!value
  if (USE_SUPABASE) {
    // guarda como chave composta no bot_features (sem migrar schema)
    const composite = `group:${groupId}:${key}`
    featuresCache[composite] = !!value
    const { error } = await supabase
      .from('bot_features')
      .upsert({ key: composite, value: !!value }, { onConflict: 'key' })
    if (error) RedLog(`[Supabase] setGroupFeature: ${error.message}`)
    markDirty('features')
    return
  }
  markDirty('features')
}

// ============================================
// PREFIXOS
// ============================================

function getGroupPrefix(groupId) {
  if (USE_SUPABASE) return prefixCache.get(groupId) || null
  return load('prefixos_grupo')[groupId] || null
}

async function setGroupPrefix(groupId, prefix) {
  if (USE_SUPABASE) {
    if (!prefix) {
      prefixCache.delete(groupId)
      await supabase.from('group_prefixes').delete().eq('group_id', groupId)
    } else {
      prefixCache.set(groupId, prefix)
      await supabase
        .from('group_prefixes')
        .upsert({ group_id: groupId, prefix }, { onConflict: 'group_id' })
    }
    return
  }
  const map = load('prefixos_grupo')
  if (!prefix) delete map[groupId]
  else map[groupId] = prefix
  markDirty('prefixos_grupo')
}

// ============================================
// MUTES / WARNS / AFK
// ============================================

function getMutes() {
  // formato legado: { [groupId]: { [userJid]: data } }
  if (!USE_SUPABASE) return load('mutes')
  const out = {}
  for (const [key, row] of mutesCache) {
    const [g, u] = key.split(':')
    if (!out[g]) out[g] = {}
    out[g][u] = row
  }
  return out
}

async function setMute(groupId, userJid, data) {
  const key = `${groupId}:${userJid}`
  if (USE_SUPABASE) {
    const row = {
      group_id: groupId,
      user_jid: userJid,
      until_ts: data?.until || data?.until_ts || null,
      by_jid: data?.by || data?.by_jid || null,
      reason: data?.reason || ''
    }
    mutesCache.set(key, row)
    await supabase.from('mutes').upsert(row, { onConflict: 'group_id,user_jid' })
    return
  }
  const m = load('mutes')
  if (!m[groupId]) m[groupId] = {}
  m[groupId][userJid] = data
  markDirty('mutes')
}

async function removeMute(groupId, userJid) {
  const key = `${groupId}:${userJid}`
  mutesCache.delete(key)
  if (USE_SUPABASE) {
    await supabase.from('mutes').delete().eq('group_id', groupId).eq('user_jid', userJid)
    return
  }
  const m = load('mutes')
  if (m[groupId]) {
    delete m[groupId][userJid]
    markDirty('mutes')
  }
}

function getWarns() {
  if (!USE_SUPABASE) return load('warns')
  // retorna cache parcial; plugins que precisam de lista completa devem usar listWarns
  return load('warns') // fallback JSON se ainda existir
}

async function addWarn(groupId, userJid, reason, byJid) {
  if (USE_SUPABASE) {
    const { data, error } = await supabase
      .from('warns')
      .insert({
        group_id: groupId,
        user_jid: userJid,
        reason: reason || '',
        by_jid: byJid || null,
        created_at: Date.now()
      })
      .select()
      .single()
    if (error) {
      RedLog(`[Supabase] addWarn: ${error.message}`)
      return null
    }
    return data
  }
  const w = load('warns')
  if (!w[groupId]) w[groupId] = {}
  if (!w[groupId][userJid]) w[groupId][userJid] = []
  w[groupId][userJid].push({ reason, by: byJid, at: Date.now() })
  markDirty('warns')
  return true
}

async function listWarns(groupId, userJid) {
  if (USE_SUPABASE) {
    let q = supabase.from('warns').select('*').eq('group_id', groupId)
    if (userJid) q = q.eq('user_jid', userJid)
    const { data, error } = await q.order('created_at', { ascending: true })
    if (error) {
      RedLog(`[Supabase] listWarns: ${error.message}`)
      return []
    }
    return data || []
  }
  const w = load('warns')
  if (userJid) return w[groupId]?.[userJid] || []
  return w[groupId] || {}
}

async function clearWarns(groupId, userJid) {
  if (USE_SUPABASE) {
    let q = supabase.from('warns').delete().eq('group_id', groupId)
    if (userJid) q = q.eq('user_jid', userJid)
    await q
    return
  }
  const w = load('warns')
  if (userJid && w[groupId]) delete w[groupId][userJid]
  else if (w[groupId]) delete w[groupId]
  markDirty('warns')
}

function getAfk(jid) {
  if (USE_SUPABASE) return afkCache.get(jid) || null
  return load('afk')[jid] || null
}

async function setAfk(jid, reason = '') {
  const row = { reason, since: Date.now() }
  afkCache.set(jid, row)
  if (USE_SUPABASE) {
    await supabase.from('afk').upsert({ jid, ...row }, { onConflict: 'jid' })
    return
  }
  const a = load('afk')
  a[jid] = row
  markDirty('afk')
}

async function clearAfk(jid) {
  afkCache.delete(jid)
  if (USE_SUPABASE) {
    await supabase.from('afk').delete().eq('jid', jid)
    return
  }
  const a = load('afk')
  delete a[jid]
  markDirty('afk')
}

// ============================================
// GRUPOS ATIVOS (já existia)
// ============================================

async function getGroupSupabase(groupId) {
  const { data, error } = await supabase
    .from('active_groups')
    .select('*')
    .eq('group_id', groupId)
    .maybeSingle()
  if (error) {
    console.error('[Supabase] grupo:', error)
    return null
  }
  return data
}

async function activateGroupSupabase(groupId, days = 30) {
  const expiresAt = Date.now() + days * 24 * 60 * 60 * 1000
  const { data, error } = await supabase
    .from('active_groups')
    .upsert(
      { group_id: groupId, active: true, expires_at: expiresAt },
      { onConflict: 'group_id' }
    )
    .select()
    .single()
  if (error) {
    console.error('[Supabase] ativar:', error)
    return null
  }
  return data
}

async function deactivateGroupSupabase(groupId) {
  const { error } = await supabase
    .from('active_groups')
    .update({ active: false })
    .eq('group_id', groupId)
  if (error) {
    console.error('[Supabase] desativar:', error)
    return false
  }
  return true
}

async function isGroupActiveSupabase(groupId) {
  const group = await getGroupSupabase(groupId)
  if (!group || !group.active) return false
  if (group.expires_at && Date.now() > group.expires_at) {
    await deactivateGroupSupabase(groupId)
    return false
  }
  return true
}

// ============================================
// BOOT
// ============================================

Object.keys(DEFAULTS).forEach((k) => {
  if (USE_SUPABASE && ['users', 'premium', 'features', 'prefixos_grupo', 'afk', 'mutes'].includes(k)) {
    return
  }
  load(k)
})

CyanLog(`📦 Database: ${USE_SUPABASE ? 'Supabase ☁️ (users+vip+donos+...)' : 'JSON local'}`)

if (USE_SUPABASE) {
  hydrateAll().catch((e) => RedLog(`hydrate: ${e.message}`))
}

process.on('exit', flushJson)
process.on('SIGINT', () => {
  flush()
  setTimeout(() => process.exit(0), 800)
})
process.on('SIGTERM', () => {
  flush()
  setTimeout(() => process.exit(0), 800)
})


async function listActiveGroupsSupabase() {
  const { data, error } = await supabase
    .from('active_groups')
    .select('*')
    .eq('active', true)
  if (error) {
    console.error('[Supabase] listActiveGroups:', error)
    return []
  }
  const now = Date.now()
  return (data || [])
    .filter((g) => !g.expires_at || g.expires_at > now)
    .map((g) => ({
      id: g.group_id,
      expires: g.expires_at,
      active: g.active,
      days: g.expires_at ? Math.ceil((g.expires_at - now) / (24 * 60 * 60 * 1000)) : null
    }))
}

module.exports = {
  load,
  markDirty,
  flush,
  backup,
  // users
  getUser,
  saveUser,
  getAllUsers,
  rankTopAsync,
  hydrateUsersFromSupabase: hydrateAll,
  // premium
  isPremium,
  addPremium,
  removePremium,
  listPremium,
  getPremium: () => ({ users: listPremium() }),
  // donos
  isDonoExtra,
  addDono,
  removeDono,
  listDonos,
  // features
  getFeatures,
  setFeature,
  getGroupFeature,
  setGroupFeature,
  // prefix
  getGroupPrefix,
  setGroupPrefix,
  // mutes / warns / afk
  getMutes,
  setMute,
  removeMute,
  getWarns,
  addWarn,
  listWarns,
  clearWarns,
  getAfk,
  setAfk,
  clearAfk,
  // grupos
  getGroup: getGroupSupabase,
  activateGroup: activateGroupSupabase,
  deactivateGroup: deactivateGroupSupabase,
  isGroupActive: isGroupActiveSupabase,
  supabase,
  USE_SUPABASE_USERS: USE_SUPABASE,
  DB_DIR
}
