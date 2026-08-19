'use strict'

/**
 * Sistema de casamento (persistente em users.json)
 *
 * Campos no usuário:
 *   spouse   → jid do cônjuge (ou null)
 *   marriedAt → timestamp
 *
 * Propostas pendentes ficam em memória (Map) e expiram em 5 min.
 */

const db = require('../core/database')

/** @type {Map<string, { from: string, to: string, at: number }>} */
const pending = new Map()

const PROPOSAL_TTL = 5 * 60 * 1000 // 5 minutos

function cleanExpired() {
  const now = Date.now()
  for (const [key, p] of pending) {
    if (now - p.at > PROPOSAL_TTL) pending.delete(key)
  }
}

function proposalKey(toJid) {
  return String(toJid)
}

function getSpouse(jid) {
  const u = db.getUser(jid)
  return u.spouse || null
}

function isMarried(jid) {
  return !!getSpouse(jid)
}

function getMarriageInfo(jid) {
  const u = db.getUser(jid)
  if (!u.spouse) return null
  return {
    spouse: u.spouse,
    marriedAt: u.marriedAt || null
  }
}

/**
 * Cria proposta de casamento.
 * @returns {{ ok: boolean, reason?: string }}
 */
function propose(fromJid, toJid) {
  cleanExpired()

  if (!fromJid || !toJid) return { ok: false, reason: 'Alvo inválido.' }
  if (fromJid === toJid) return { ok: false, reason: 'Você não pode casar consigo mesmo 😅' }

  if (isMarried(fromJid)) return { ok: false, reason: 'Você já está casado(a)! Use .divorciar primeiro.' }
  if (isMarried(toJid)) return { ok: false, reason: 'Essa pessoa já está casada!' }

  // Já tem proposta pendente para essa pessoa?
  const existing = pending.get(proposalKey(toJid))
  if (existing && existing.from === fromJid) {
    return { ok: false, reason: 'Você já pediu essa pessoa em casamento. Aguarde a resposta.' }
  }
  if (existing) {
    return { ok: false, reason: 'Essa pessoa já tem um pedido de casamento pendente.' }
  }

  pending.set(proposalKey(toJid), { from: fromJid, to: toJid, at: Date.now() })
  return { ok: true }
}

/**
 * Aceita proposta (quem aceita é o "to").
 */
function accept(toJid) {
  cleanExpired()
  const key = proposalKey(toJid)
  const p = pending.get(key)
  if (!p) return { ok: false, reason: 'Você não tem nenhum pedido de casamento pendente.' }

  if (isMarried(p.from) || isMarried(p.to)) {
    pending.delete(key)
    return { ok: false, reason: 'Um de vocês já se casou no meio do caminho 😅' }
  }

  const now = Date.now()
  db.saveUser(p.from, { spouse: p.to, marriedAt: now })
  db.saveUser(p.to, { spouse: p.from, marriedAt: now })
  pending.delete(key)

  return { ok: true, partner: p.from }
}

/**
 * Recusa proposta.
 */
function reject(toJid) {
  cleanExpired()
  const key = proposalKey(toJid)
  const p = pending.get(key)
  if (!p) return { ok: false, reason: 'Você não tem nenhum pedido de casamento pendente.' }
  pending.delete(key)
  return { ok: true, from: p.from }
}

/**
 * Divórcio mútuo (qualquer um dos dois pode pedir).
 */
function divorce(jid) {
  const spouse = getSpouse(jid)
  if (!spouse) return { ok: false, reason: 'Você não está casado(a).' }

  db.saveUser(jid, { spouse: null, marriedAt: null })
  // limpa o outro também se ainda apontar pra cá
  const other = db.getUser(spouse)
  if (other.spouse === jid) {
    db.saveUser(spouse, { spouse: null, marriedAt: null })
  }
  return { ok: true, ex: spouse }
}

function hasPending(toJid) {
  cleanExpired()
  return pending.has(proposalKey(toJid))
}

function getPending(toJid) {
  cleanExpired()
  return pending.get(proposalKey(toJid)) || null
}

function formatDate(ts) {
  if (!ts) return '?'
  try {
    return new Date(ts).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  } catch {
    return '?'
  }
}

module.exports = {
  propose,
  accept,
  reject,
  divorce,
  getSpouse,
  isMarried,
  getMarriageInfo,
  hasPending,
  getPending,
  formatDate
}
