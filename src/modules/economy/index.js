'use strict'

const db = require('../../core/database')
const { clamp } = require('../../utils/helpers')

function getBalance(jid) {
  return db.getUser(jid).coins || 0
}

function addCoins(jid, amount) {
  const u = db.getUser(jid)
  u.coins = Math.max(0, (u.coins || 0) + amount)
  db.saveUser(jid, u)
  return u.coins
}

function removeCoins(jid, amount) {
  const u = db.getUser(jid)
  if ((u.coins || 0) < amount) return false
  u.coins -= amount
  db.saveUser(jid, u)
  return true
}

function transfer(from, to, amount) {
  amount = Math.floor(amount)
  if (amount <= 0) return { ok: false, reason: 'Valor inválido.' }
  if (!removeCoins(from, amount)) return { ok: false, reason: 'Saldo insuficiente.' }
  addCoins(to, amount)
  return { ok: true }
}

/**
 * Daily reward. Retorna { ok, amount, next } ou { ok:false, remainingMs }
 */
function claimDaily(jid, config) {
  const u = db.getUser(jid)
  const now = Date.now()
  const day = 24 * 60 * 60 * 1000
  if (u.daily && now - u.daily < day) {
    return { ok: false, remainingMs: day - (now - u.daily) }
  }
  const min = config.moeda?.dailyMin ?? 50
  const max = config.moeda?.dailyMax ?? 150
  const amount = Math.floor(Math.random() * (max - min + 1)) + min
  u.daily = now
  u.coins = (u.coins || 0) + amount
  db.saveUser(jid, u)
  return { ok: true, amount, balance: u.coins }
}

const LOJA = [
  { id: 'xp_boost', nome: 'Boost de XP (1h)', preco: 200, desc: 'Dobra XP por 1 hora' },
  { id: 'titulo_sombrio', nome: 'Título Sombrio', preco: 500, desc: 'Título cosmético no perfil' },
  { id: 'sorte', nome: 'Amuleto da Sorte', preco: 300, desc: '+10% chance em jogos' }
]

function listShop() {
  return LOJA
}

function buy(jid, itemId) {
  const item = LOJA.find((i) => i.id === itemId)
  if (!item) return { ok: false, reason: 'Item não encontrado.' }
  if (!removeCoins(jid, item.preco)) return { ok: false, reason: 'Saldo insuficiente.' }
  const u = db.getUser(jid)
  if (!u.inventory) u.inventory = []
  u.inventory.push({ id: item.id, boughtAt: Date.now() })
  db.saveUser(jid, u)
  return { ok: true, item }
}

module.exports = {
  getBalance,
  addCoins,
  removeCoins,
  transfer,
  claimDaily,
  listShop,
  buy
}
