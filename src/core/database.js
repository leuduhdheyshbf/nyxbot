'use strict'

const fs = require('fs')
const path = require('path')
const { ensureDir } = require('../utils/helpers')
const { CyanLog, RedLog } = require('./logger')

const ROOT = path.join(__dirname, '..', '..')
const DB_DIR = path.join(ROOT, 'database', 'json')
const BACKUP_DIR = path.join(ROOT, 'database', 'backups')

ensureDir(DB_DIR)
ensureDir(BACKUP_DIR)

const DEFAULTS = {
  users: {},
  economy: {},
  levels: {},
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
  groups: {},
  prefixos_grupo: {}
}

/** Cache em memória + dirty flags para escrita debounced */
const store = {}
const dirty = new Set()
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
  dirty.add(name)
  if (!flushTimer) {
    flushTimer = setTimeout(flush, 2000)
  }
}

function flush() {
  flushTimer = null
  for (const name of dirty) {
    try {
      fs.writeFileSync(filePath(name), JSON.stringify(store[name], null, 2))
    } catch (e) {
      RedLog(`DB save ${name}: ${e.message}`)
    }
  }
  dirty.clear()
}

function backup(name) {
  try {
    const src = filePath(name)
    if (!fs.existsSync(src)) return
    const dest = path.join(BACKUP_DIR, `${name}-${Date.now()}.json`)
    fs.copyFileSync(src, dest)
  } catch (e) {
    RedLog(`Backup ${name}: ${e.message}`)
  }
}

// --- API de alto nível ---

function getUser(jid) {
  const users = load('users')
  if (!users[jid]) {
    users[jid] = {
      jid,
      nome: '',
      coins: 0,
      xp: 0,
      level: 1,
      daily: 0,
      wins: 0,
      losses: 0,
      achievements: [],
      createdAt: Date.now()
    }
    markDirty('users')
  }
  return users[jid]
}

function saveUser(jid, data) {
  const users = load('users')
  users[jid] = { ...users[jid], ...data }
  markDirty('users')
}

function getFeatures() {
  return load('features')
}

function setFeature(key, value) {
  const f = load('features')
  f[key] = value
  markDirty('features')
}

function getPremium() {
  return load('premium')
}

function isPremium(jid, donoList = []) {
  if (donoList.some((d) => d === jid || cleanMatch(d, jid))) return true
  const p = load('premium')
  return (p.users || []).includes(jid)
}

function cleanMatch(a, b) {
  const ca = String(a || '').split('@')[0].replace(/\D/g, '')
  const cb = String(b || '').split('@')[0].replace(/\D/g, '')
  return ca && ca === cb
}

function addPremium(jid) {
  const p = load('premium')
  if (!p.users.includes(jid)) {
    p.users.push(jid)
    markDirty('premium')
    return true
  }
  return false
}

function removePremium(jid) {
  const p = load('premium')
  const i = p.users.indexOf(jid)
  if (i >= 0) {
    p.users.splice(i, 1)
    markDirty('premium')
    return true
  }
  return false
}

function getGroupPrefix(groupId) {
  const map = load('prefixos_grupo')
  return map[groupId] || null
}

function setGroupPrefix(groupId, prefix) {
  const map = load('prefixos_grupo')
  if (!prefix) {
    delete map[groupId]
  } else {
    map[groupId] = prefix
  }
  markDirty('prefixos_grupo')
}

function getMutes() {
  return load('mutes')
}

function getWarns() {
  return load('warns')
}

// Inicializa defaults na subida
Object.keys(DEFAULTS).forEach((k) => load(k))
CyanLog(`📦 Database carregado (${Object.keys(DEFAULTS).length} coleções)`)

// Flush ao sair
process.on('exit', flush)
process.on('SIGINT', () => {
  flush()
  process.exit(0)
})


// --- Aluguel / ativação de grupos (30 dias) ---

function getGroups() {
  return load('groups')
}

function getGroup(groupId) {
  const groups = load('groups')
  return groups[groupId] || null
}

/**
 * Ativa ou renova o grupo por N dias (padrão 30).
 * @returns {{ active: boolean, expires: number, days: number }}
 */
function activateGroup(groupId, days = 30, activatedBy = null) {
  const groups = load('groups')
  const d = Math.max(1, Math.min(3650, Number(days) || 30))
  const expires = Date.now() + d * 24 * 60 * 60 * 1000
  groups[groupId] = {
    active: true,
    expires,
    activatedAt: Date.now(),
    activatedBy: activatedBy || null,
    days: d
  }
  markDirty('groups')
  return groups[groupId]
}

function deactivateGroup(groupId) {
  const groups = load('groups')
  if (!groups[groupId]) return false
  groups[groupId].active = false
  markDirty('groups')
  return true
}

/**
 * true se o grupo pode usar o bot.
 * Grupos nunca cadastrados = inativos (precisa ativar).
 * Dono bypassa no handler.
 */
function isGroupActive(groupId) {
  const g = getGroup(groupId)
  if (!g) return false
  if (!g.active) return false
  if (g.expires && Date.now() > g.expires) {
    g.active = false
    markDirty('groups')
    return false
  }
  return true
}

function listActiveGroups() {
  const groups = load('groups')
  const now = Date.now()
  return Object.entries(groups)
    .filter(([, g]) => g.active && (!g.expires || g.expires > now))
    .map(([id, g]) => ({ id, ...g }))
}


module.exports = {
  load,
  markDirty,
  flush,
  backup,
  getUser,
  saveUser,
  getFeatures,
  setFeature,
  getPremium,
  isPremium,
  addPremium,
  removePremium,
  getGroupPrefix,
  setGroupPrefix,
  getMutes,
  getWarns,
  getGroups,
  getGroup,
  activateGroup,
  deactivateGroup,
  isGroupActive,
  listActiveGroups,
  DB_DIR
}
