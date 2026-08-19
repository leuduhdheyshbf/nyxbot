'use strict'

const db = require('../../core/database')

function xpForLevel(level, config) {
  const base = config.niveis?.xpBase ?? 100
  const mult = config.niveis?.multiplicador ?? 1.35
  return Math.floor(base * Math.pow(mult, level - 1))
}

function addXp(jid, amount, config) {
  const u = db.getUser(jid)
  u.xp = (u.xp || 0) + amount
  let leveled = false
  let need = xpForLevel(u.level || 1, config)
  while (u.xp >= need) {
    u.xp -= need
    u.level = (u.level || 1) + 1
    leveled = true
    need = xpForLevel(u.level, config)
  }
  db.saveUser(jid, u)
  return { level: u.level, xp: u.xp, need, leveled }
}

function getProfile(jid, config) {
  const u = db.getUser(jid)
  const need = xpForLevel(u.level || 1, config)
  return {
    ...u,
    need,
    progress: need ? Math.min(100, Math.floor(((u.xp || 0) / need) * 100)) : 0
  }
}

function rankTop(limit = 10) {
  const users = db.load('users')
  return Object.values(users)
    .sort((a, b) => (b.level || 1) - (a.level || 1) || (b.xp || 0) - (a.xp || 0))
    .slice(0, limit)
}

module.exports = { xpForLevel, addXp, getProfile, rankTop }
