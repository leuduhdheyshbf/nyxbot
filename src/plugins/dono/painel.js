'use strict'

const db = require('../../core/database')

function formatDate(ts) {
  if (!ts) return '—'
  try {
    return new Date(ts).toLocaleString('pt-BR', { timeZone: 'America/Sao_Paulo' })
  } catch {
    return String(ts)
  }
}

function remainingLabel(expiresAt) {
  if (!expiresAt) return 'sem data'
  const ms = Number(expiresAt) - Date.now()
  if (ms <= 0) return 'expirado'
  const days = Math.floor(ms / (24 * 60 * 60 * 1000))
  const hours = Math.floor((ms % (24 * 60 * 60 * 1000)) / (60 * 60 * 1000))
  const mins = Math.floor((ms % (60 * 60 * 1000)) / (60 * 1000))
  if (days >= 1) return `${days}d ${hours}h restantes`
  if (hours >= 1) return `${hours}h ${mins}m restantes`
  return `${mins}m restantes`
}

module.exports = {
  name: 'painel',
  description: 'Painel exclusivo do dono',
  category: 'dono',
  aliases: ['ownerpanel', 'adm', 'donomenu'],
  dono: true,
  cooldown: 1,

  async execute({ from, prefix, reply, isDono, args, config, isGroup }) {
    if (!isDono) {
      return reply('❌ Este comando é apenas para o *dono* do bot!')
    }

    const p = prefix || '.'
    const sub = (args[0] || '').toLowerCase()

    // .painel grupos
    if (sub === 'grupos' || sub === 'listar') {
      try {
        const list =
          typeof db.listActiveGroups === 'function' ? await db.listActiveGroups() : []
        if (!list.length) return reply('📭 Nenhum grupo ativo no momento.')
        let text = `📋 *Grupos ativos (${list.length})*\n\n`
        for (const g of list.slice(0, 40)) {
          const id = g.id || g.group_id
          const exp = g.expires || g.expires_at
          text += `• \`${id}\`\n`
          text += `  ⏰ ${formatDate(exp)}\n`
          text += `  ⏳ ${remainingLabel(exp)}\n\n`
        }
        return reply(text.trim())
      } catch (e) {
        return reply(`❌ Erro ao listar grupos: ${e.message}`)
      }
    }

    // .painel status [id]
    if (sub === 'status') {
      try {
        let id = args[1] || (isGroup ? from : null)
        if (!id) {
          return reply(`📌 Uso: *${p}painel status <id>*\nOu use no grupo: *${p}painel status*`)
        }
        if (!id.endsWith('@g.us')) id += '@g.us'
        const g = typeof db.getGroup === 'function' ? await db.getGroup(id) : null
        if (!g) return reply('❌ Grupo não cadastrado.')
        const exp = g.expires_at || g.expires
        const ativo = g.active && exp && Number(exp) > Date.now()
        return reply(
          `📊 *Status do aluguel*\n\n` +
            `🆔 \`${id}\`\n` +
            `Ativo: ${ativo ? '✅' : '❌'}\n` +
            `Expira: *${formatDate(exp)}*\n` +
            `Restam: *${remainingLabel(exp)}*`
        )
      } catch (e) {
        return reply(`❌ ${e.message}`)
      }
    }

    // .painel aluguel — status do grupo atual
    if (sub === 'aluguel' || sub === 'dias' || sub === 'tempo') {
      if (!isGroup) return reply('❌ Use este subcomando *dentro do grupo*.')
      try {
        const g = typeof db.getGroup === 'function' ? await db.getGroup(from) : null
        if (!g || !g.active) {
          return reply('❌ Este grupo *não está ativo* no aluguel.')
        }
        const exp = g.expires_at || g.expires
        return reply(
          `🩸 *Aluguel deste grupo*\n\n` +
            `Ativo: ✅\n` +
            `Expira: *${formatDate(exp)}*\n` +
            `Restam: *${remainingLabel(exp)}*`
        )
      } catch (e) {
        return reply(`❌ ${e.message}`)
      }
    }

    // status rápido do grupo atual no menu
    let aluguelLine = ''
    if (isGroup) {
      try {
        const g = typeof db.getGroup === 'function' ? await db.getGroup(from) : null
        if (g && g.active) {
          const exp = g.expires_at || g.expires
          aluguelLine =
            `\n📌 *Este grupo*\n` +
            `├ Expira: ${formatDate(exp)}\n` +
            `└ Restam: *${remainingLabel(exp)}*\n`
        } else {
          aluguelLine = `\n📌 *Este grupo:* ❌ sem aluguel ativo\n`
        }
      } catch {}
    }

    const nome = config?.NomeDoDono || 'Dono'
    const menu = `
╭─────────────────────────────╮
│  🩸  *NYX — PAINEL DO DONO*  │
╰─────────────────────────────╯
Olá, *${nome}*
${aluguelLine}
🧊 *ALUGUEL / GRUPOS*
├ ${p}ativar_grupo [dias]
├ ${p}reativar [dias]
├ ${p}desativar_grupo
├ ${p}painel grupos
├ ${p}painel status [id]
└ ${p}painel aluguel
    ↳ dias restantes neste grupo

📋 *STATUS*
├ ${p}status
└ ${p}logs

⚙️ *CONFIG*
├ ${p}setprefix [novo]
├ ${p}setnome [nome]
└ ${p}setbio [bio]

👑 *DONOS / VIP*
├ ${p}adddono @user
├ ${p}deldono @user
├ ${p}addvip @user
├ ${p}delvip @user
└ ${p}listvip

📢 *BROADCAST*
├ ${p}broadcast [msg]
└ ${p}bcgrupo [msg]

🔧 *OUTROS*
├ ${p}block @user
├ ${p}unblock @user
├ ${p}join [link]
├ ${p}sair
└ ${p}reiniciar
`.trim()

    return reply(menu)
  }
}
