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

module.exports = {
  name: 'painel',
  description: 'Painel exclusivo do dono',
  category: 'dono',
  aliases: ['ownerpanel', 'adm', 'donomenu'],
  dono: true,
  cooldown: 1,

  async execute({ from, prefix, reply, isDono, args, config }) {
    if (!isDono) {
      return reply('❌ Este comando é apenas para o *dono* do bot!')
    }

    const p = prefix || '.'
    const sub = (args[0] || '').toLowerCase()

    if (sub === 'grupos' || sub === 'listar') {
      try {
        const list = typeof db.listActiveGroups === 'function' ? db.listActiveGroups() : []
        if (!list.length) return reply('📭 Nenhum grupo ativo no momento.')
        let text = `📋 *Grupos ativos (${list.length})*\n\n`
        for (const g of list.slice(0, 30)) {
          text += `• \`${g.id}\`\n  expira: ${formatDate(g.expires)}\n`
        }
        return reply(text)
      } catch (e) {
        return reply(`❌ Erro ao listar grupos: ${e.message}`)
      }
    }

    if (sub === 'status' && args[1]) {
      try {
        let id = args[1]
        if (!id.endsWith('@g.us')) id += '@g.us'
        const g = typeof db.getGroup === 'function' ? db.getGroup(id) : null
        if (!g) return reply('❌ Grupo não cadastrado.')
        return reply(
          `📊 *Status do grupo*\n\n` +
            `🆔 \`${id}\`\n` +
            `Ativo: ${g.active && g.expires > Date.now() ? '✅' : '❌'}\n` +
            `Expira: ${formatDate(g.expires)}\n` +
            `Dias config.: ${g.days || '—'}`
        )
      } catch (e) {
        return reply(`❌ ${e.message}`)
      }
    }

    const nome = config?.NomeDoDono || 'Dono'
    const menu = `
╭─────────────────────────────╮
│  🩸  *NYX — PAINEL DO DONO*  │
╰─────────────────────────────╯
Olá, *${nome}*

🧊 *ALUGUEL / GRUPOS*
├ ${p}ativar_grupo [dias]
├ ${p}reativar [dias]
├ ${p}desativar_grupo
├ ${p}painel grupos
└ ${p}painel status <id>

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
