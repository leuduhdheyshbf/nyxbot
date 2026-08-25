'use strict'

const db = require('../core/database')

function normalizeJid(value) {
  if (!value) return null
  const raw = String(value).trim()
  if (raw.includes('@')) return raw
  const number = raw.replace(/\D/g, '')
  return number ? `${number}@s.whatsapp.net` : null
}

async function isBlacklisted(groupId, jid) {
  const target = normalizeJid(jid)
  if (!groupId || !target) return false

  const { data, error } = await db.supabase
    .from('group_blacklist')
    .select('id')
    .eq('group_id', groupId)
    .eq('user_jid', target)
    .maybeSingle()

  if (error) {
    console.error(`[BLACKLIST][Supabase] consulta: ${error.message}`)
    return false
  }
  return !!data
}

async function addBlacklist(groupId, jid, byJid = null, reason = '') {
  const target = normalizeJid(jid)
  if (!groupId || !target) return false

  const { error } = await db.supabase
    .from('group_blacklist')
    .upsert(
      {
        group_id: groupId,
        user_jid: target,
        phone: target.split('@')[0].split(':')[0].replace(/\D/g, ''),
        by_jid: normalizeJid(byJid),
        reason: String(reason || '').slice(0, 500)
      },
      { onConflict: 'group_id,user_jid' }
    )

  if (error) {
    console.error(`[BLACKLIST][Supabase] adicionar: ${error.message}`)
    return false
  }
  return true
}

async function removeBlacklist(groupId, jid) {
  const target = normalizeJid(jid)
  if (!groupId || !target) return false

  const { data, error } = await db.supabase
    .from('group_blacklist')
    .delete()
    .eq('group_id', groupId)
    .eq('user_jid', target)
    .select('id')

  if (error) {
    console.error(`[BLACKLIST][Supabase] remover: ${error.message}`)
    return false
  }
  return Array.isArray(data) && data.length > 0
}

async function listBlacklist(groupId) {
  if (!groupId) return []

  const { data, error } = await db.supabase
    .from('group_blacklist')
    .select('user_jid,by_jid,reason,created_at')
    .eq('group_id', groupId)
    .order('created_at', { ascending: true })

  if (error) {
    console.error(`[BLACKLIST][Supabase] listar: ${error.message}`)
    return []
  }
  return data || []
}

module.exports = {
  normalizeJid,
  isBlacklisted,
  addBlacklist,
  removeBlacklist,
  listBlacklist
}
