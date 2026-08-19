#!/usr/bin/env node
'use strict'

/**
 * Migra database/json/users.json → tabela users no Supabase
 *
 * Uso:
 *   node scripts/migrate-users-to-supabase.js
 *
 * Requer SUPABASE_URL e SUPABASE_ANON_KEY (ou SERVICE_KEY) no env.
 */

const fs = require('fs')
const path = require('path')
const { createClient } = require('@supabase/supabase-js')

const ROOT = path.join(__dirname, '..')
const USERS_FILE = path.join(ROOT, 'database', 'json', 'users.json')

const supabaseUrl = process.env.SUPABASE_URL || 'https://nzcdwfktdtvfxtfsapon.supabase.co'
const supabaseKey =
  process.env.SUPABASE_SERVICE_KEY ||
  process.env.SUPABASE_ANON_KEY ||
  'sb_publishable_jmFRjEk6sWWNy6JoNVLM0Q_dNhrnu2T'

const supabase = createClient(supabaseUrl, supabaseKey)

function toRow(u) {
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

async function main() {
  if (!fs.existsSync(USERS_FILE)) {
    console.error('Arquivo não encontrado:', USERS_FILE)
    process.exit(1)
  }

  const users = JSON.parse(fs.readFileSync(USERS_FILE, 'utf8'))
  const list = Object.values(users).filter((u) => u && u.jid)
  console.log(`Migrando ${list.length} usuários...`)

  const BATCH = 50
  let ok = 0
  let fail = 0

  for (let i = 0; i < list.length; i += BATCH) {
    const chunk = list.slice(i, i + BATCH).map(toRow)
    const { error } = await supabase.from('users').upsert(chunk, { onConflict: 'jid' })
    if (error) {
      console.error('Erro no lote', i, error.message)
      fail += chunk.length
    } else {
      ok += chunk.length
      console.log(`  ${ok}/${list.length}`)
    }
  }

  console.log(`Concluído. OK=${ok} FAIL=${fail}`)
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
