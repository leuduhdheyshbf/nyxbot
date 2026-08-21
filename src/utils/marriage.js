'use strict'

/**
 * Sistema de casamento (persistente em Supabase)
 *
 * Tabela: marriage_proposals
 * Colunas: from_jid, to_jid, created_at
 */

const db = require('../core/database')

// Função auxiliar para limpar pedidos expirados (mais de 5 minutos)
async function cleanExpiredProposals() {
  try {
    const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000).toISOString()
    await db.supabase
    .from('marriage_proposals')
    .delete()
    .lt('created_at', fiveMinutesAgo)
  } catch (err) {
    console.error('[Marriage] Erro ao limpar pedidos expirados:', err.message)
  }
}

function getSpouse(jid) {
  const u = db.getUser(jid)
  return u?.spouse || null
}

function isMarried(jid) {
  return !!getSpouse(jid)
}

function getMarriageInfo(jid) {
  const u = db.getUser(jid)
  if (!u?.spouse) return null
    return {
      spouse: u.spouse,
      marriedAt: u.marriedAt || null
    }
}

/**
 * Cria proposta de casamento (Salva no Supabase)
 */
async function propose(fromJid, toJid) {
  // Limpa expirados antes de checar
  await cleanExpiredProposals()

  if (!fromJid || !toJid) return { ok: false, reason: 'Alvo inválido.' }
  if (fromJid === toJid) return { ok: false, reason: 'Você não pode casar consigo mesmo 😅' }

  if (isMarried(fromJid)) return { ok: false, reason: 'Você já está casado(a)! Use .divorciar primeiro.' }
  if (isMarried(toJid)) return { ok: false, reason: 'Essa pessoa já está casada!' }

  try {
    // Verifica se já existe um pedido ativo para essa pessoa
    const { data: existing, error: checkError } = await db.supabase
    .from('marriage_proposals')
    .select('from_jid')
    .eq('to_jid', toJid)
    .maybeSingle()

    if (checkError) throw checkError

      if (existing) {
        if (existing.from_jid === fromJid) {
          return { ok: false, reason: 'Você já pediu essa pessoa em casamento. Aguarde a resposta.' }
        }
        return { ok: false, reason: 'Essa pessoa já tem um pedido de casamento pendente de outra pessoa.' }
      }

      // Insere o novo pedido
      const { error: insertError } = await db.supabase
      .from('marriage_proposals')
      .insert({ from_jid: fromJid, to_jid: toJid })

      if (insertError) throw insertError

        return { ok: true }

  } catch (err) {
    console.error('[Marriage] Erro ao propor casamento:', err.message)
    return { ok: false, reason: 'Erro interno ao salvar pedido. Tente novamente.' }
  }
}

/**
 * Aceita proposta (Busca no Supabase e apaga após casar)
 */
async function accept(toJid) {
  await cleanExpiredProposals()

  try {
    // Busca o pedido pendente
    const { data: proposal, error: fetchError } = await db.supabase
    .from('marriage_proposals')
    .select('from_jid')
    .eq('to_jid', toJid)
    .maybeSingle()

    if (fetchError) throw fetchError

      if (!proposal) {
        if (isMarried(toJid)) {
          return { ok: false, reason: 'Você já está casado(a)!' }
        }
        return { ok: false, reason: 'Você não tem nenhum pedido de casamento pendente.' }
      }

      const fromJid = proposal.from_jid

      // Verifica se alguém casou enquanto isso
      if (isMarried(fromJid) || isMarried(toJid)) {
        // Remove o pedido caso alguém já esteja casado
        await db.supabase.from('marriage_proposals').delete().eq('to_jid', toJid)
        return { ok: false, reason: 'Um de vocês já se casou no meio do caminho 😅' }
      }

      const now = Date.now()

      // Salva o casamento no banco de usuários (usando o saveUser do seu db)
      try {
        db.saveUser(fromJid, { spouse: toJid, marriedAt: now })
        db.saveUser(toJid, { spouse: fromJid, marriedAt: now })
      } catch (err) {
        console.error('[Marriage] Erro ao salvar no banco de usuários:', err.message)
        return { ok: false, reason: 'Erro interno ao salvar o casamento. Tente novamente.' }
      }

      // Remove o pedido do Supabase (já foi aceito)
      await db.supabase.from('marriage_proposals').delete().eq('to_jid', toJid)

      return { ok: true, partner: fromJid }

  } catch (err) {
    console.error('[Marriage] Erro ao aceitar casamento:', err.message)
    return { ok: false, reason: 'Erro no banco de dados. Tente novamente.' }
  }
}

/**
 * Recusa proposta (apaga do Supabase)
 */
async function reject(toJid) {
  await cleanExpiredProposals()

  try {
    const { data: proposal, error: fetchError } = await db.supabase
    .from('marriage_proposals')
    .select('from_jid')
    .eq('to_jid', toJid)
    .maybeSingle()

    if (fetchError) throw fetchError

      if (!proposal) {
        return { ok: false, reason: 'Você não tem nenhum pedido de casamento pendente.' }
      }

      // Apaga o pedido
      await db.supabase.from('marriage_proposals').delete().eq('to_jid', toJid)

      return { ok: true, from: proposal.from_jid }

  } catch (err) {
    console.error('[Marriage] Erro ao recusar casamento:', err.message)
    return { ok: false, reason: 'Erro ao recusar pedido.' }
  }
}

/**
 * Divórcio mútuo (qualquer um dos dois pode pedir).
 */
function divorce(jid) {
  const spouse = getSpouse(jid)
  if (!spouse) return { ok: false, reason: 'Você não está casado(a).' }

  db.saveUser(jid, { spouse: null, marriedAt: null })
  const other = db.getUser(spouse)
  if (other?.spouse === jid) {
    db.saveUser(spouse, { spouse: null, marriedAt: null })
  }
  return { ok: true, ex: spouse }
}

async function hasPending(toJid) {
  await cleanExpiredProposals()
  const { data, error } = await db.supabase
  .from('marriage_proposals')
  .select('id')
  .eq('to_jid', toJid)
  .limit(1)

  if (error) {
    console.error('[Marriage] Erro ao verificar pending:', error.message)
    return false
  }
  return data && data.length > 0
}

async function getPending(toJid) {
  await cleanExpiredProposals()
  const { data, error } = await db.supabase
  .from('marriage_proposals')
  .select('from_jid, to_jid, created_at')
  .eq('to_jid', toJid)
  .maybeSingle()

  if (error || !data) return null
    return { from: data.from_jid, to: data.to_jid, at: new Date(data.created_at).getTime() }
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
