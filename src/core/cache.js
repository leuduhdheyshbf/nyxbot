'use strict'

const NodeCache = require('node-cache')

/** Cache genérico em memória (TTL em segundos) */
const memory = new NodeCache({ stdTTL: 300, checkperiod: 60, useClones: false })

/** Cache de metadata de grupos */
const groups = new NodeCache({ stdTTL: 300, checkperiod: 60, useClones: false })

/** Cooldowns de comandos: key = `${jid}:${cmd}` */
const cooldowns = new Map()

function setCooldown(key, seconds) {
  cooldowns.set(key, Date.now() + seconds * 1000)
}

function getCooldownRemaining(key) {
  const until = cooldowns.get(key)
  if (!until) return 0
  const left = Math.ceil((until - Date.now()) / 1000)
  if (left <= 0) {
    cooldowns.delete(key)
    return 0
  }
  return left
}

/** Limpa cooldowns expirados periodicamente */
setInterval(() => {
  const now = Date.now()
  for (const [k, until] of cooldowns) {
    if (until <= now) cooldowns.delete(k)
  }
}, 60_000)

module.exports = {
  memory,
  groups,
  setCooldown,
  getCooldownRemaining
}
