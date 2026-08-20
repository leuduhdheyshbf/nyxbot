'use strict'

const fs = require('fs')
const path = require('path')
const axios = require('axios')

/** Só dígitos do JID/número */
function cleanNumber(j) {
  return String(j || '')
    .split('@')[0]
    .split(':')[0]
    .replace(/\D/g, '')
}

/**
 * Normaliza qualquer input para JID quando possível.
 * LID sem phoneNumber associado → null (não inventa número).
 */
function toJid(input) {
  if (!input) return null
  const s = String(input)
  if (s.endsWith('@s.whatsapp.net') || s.endsWith('@g.us')) return s
  if (s.endsWith('@lid')) {
    // LID puro não converte sem phoneNumber
    return null
  }
  const n = s.replace(/\D/g, '')
  return n.length >= 10 ? `${n}@s.whatsapp.net` : null
}

/**
 * Compara dois identificadores (número, @s.whatsapp.net, @lid, participant)
 * Aceita match por:
 *  - string igual
 *  - cleanNumber igual (quando ambos têm dígitos)
 *  - user part igual (antes do @)
 */
function sameUser(a, b) {
  if (!a || !b) return false
  const sa = String(a)
  const sb = String(b)
  if (sa === sb) return true

  const ua = sa.split(':')[0].split('@')[0]
  const ub = sb.split(':')[0].split('@')[0]
  if (ua && ub && ua === ub) return true

  const na = cleanNumber(sa)
  const nb = cleanNumber(sb)
  // só confia em cleanNumber se ambos tiverem número “de verdade”
  if (na && nb && na.length >= 8 && nb.length >= 8 && na === nb) return true

  return false
}

/**
 * Lista de IDs possíveis de um participant do Baileys 6/7
 * (id, phoneNumber, jid, lid…)
 */
function participantIds(p) {
  if (!p) return []
  if (typeof p === 'string') return [p]
  const ids = [p.id, p.phoneNumber, p.jid, p.participant, p.lid].filter(Boolean)
  return [...new Set(ids.map(String))]
}

/**
 * Admins do grupo (JIDs / ids brutos)
 */
function getGroupAdmins(participants = []) {
  return participants
    .filter((p) => p && (p.admin === 'admin' || p.admin === 'superadmin'))
    .flatMap((p) => participantIds(p))
    .filter(Boolean)
}

/**
 * True se sender é admin/superadmin no array de participants
 */
function isParticipantAdmin(participants = [], senderJid) {
  if (!senderJid) return false
  return participants.some((p) => {
    if (!p || (p.admin !== 'admin' && p.admin !== 'superadmin')) return false
    return participantIds(p).some((id) => sameUser(id, senderJid))
  })
}

/**
 * True se sender é superadmin (criador)
 */
function isParticipantSuperAdmin(participants = [], senderJid) {
  if (!senderJid) return false
  return participants.some((p) => {
    if (!p || p.admin !== 'superadmin') return false
    return participantIds(p).some((id) => sameUser(id, senderJid))
  })
}

function getMembers(participants = []) {
  return participants
    .flatMap((p) => participantIds(p))
    .filter(Boolean)
}

function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms))
}

function getRandom(ext = '') {
  return `${Date.now()}${Math.floor(Math.random() * 10000)}${ext}`
}

async function fetchJson(url, options = {}) {
  const res = await axios.get(url, { timeout: 30000, ...options })
  return res.data
}

async function getBuffer(url) {
  const res = await axios.get(url, { responseType: 'arraybuffer', timeout: 60000 })
  return Buffer.from(res.data)
}

function ensureDir(dir) {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true })
}

function safeUnlink(file) {
  try {
    if (file && fs.existsSync(file)) fs.unlinkSync(file)
  } catch {}
}

function pick(arr) {
  return arr[Math.floor(Math.random() * arr.length)]
}

function clamp(n, min, max) {
  return Math.max(min, Math.min(max, n))
}

module.exports = {
  cleanNumber,
  toJid,
  sameUser,
  participantIds,
  getGroupAdmins,
  isParticipantAdmin,
  isParticipantSuperAdmin,
  getMembers,
  sleep,
  getRandom,
  fetchJson,
  getBuffer,
  ensureDir,
  safeUnlink,
  pick,
  clamp
}
