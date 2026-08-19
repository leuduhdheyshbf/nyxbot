'use strict'

const fs = require('fs')
const path = require('path')
const axios = require('axios')

function cleanNumber(j) {
  return String(j || '').split('@')[0].split(':')[0].replace(/\D/g, '')
}

function toJid(input) {
  if (!input) return null
  const s = String(input)
  if (s.endsWith('@s.whatsapp.net') || s.endsWith('@g.us')) return s
  if (s.endsWith('@lid')) {
    const n = s.replace('@lid', '').replace(/\D/g, '')
    return n.length >= 10 ? `${n}@s.whatsapp.net` : null
  }
  const n = s.replace(/\D/g, '')
  return n.length >= 10 ? `${n}@s.whatsapp.net` : null
}

function getGroupAdmins(participants = []) {
  return participants
    .filter((p) => p.admin === 'admin' || p.admin === 'superadmin')
    .map((p) => {
      let base = p.phoneNumber ?? p.id ?? p.jid
      if (!base) return null
      if (String(base).endsWith('@lid') && p.phoneNumber) base = p.phoneNumber
      return toJid(base) || base
    })
    .filter(Boolean)
}

function getMembers(participants = []) {
  return participants
    .map((p) => {
      let base = p.phoneNumber ?? p.id ?? p.jid
      if (!base) return null
      if (String(base).endsWith('@lid') && p.phoneNumber) base = p.phoneNumber
      return toJid(base) || base
    })
    .filter(Boolean)
}

function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms))
}

function getRandom(ext = '') {
  return `${Math.floor(Math.random() * 10000)}${Date.now()}${ext}`
}

async function fetchJson(url, options = {}) {
  const res = await axios({ url, method: 'GET', ...options })
  return res.data
}

async function getBuffer(url) {
  const res = await axios.get(url, { responseType: 'arraybuffer' })
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
  getGroupAdmins,
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
