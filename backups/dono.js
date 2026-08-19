'use strict'

const db = require('../../core/database')

function formatDate(ts) {
  if (!ts) return '—'
  return new Date(ts).toLocaleString('pt-BR', { timeZone: 'America/Sao_Paulo' })
}

module.exports = {
  name: 'dono',
  description: 'Painel exclusivo do dono',
  category: 'dono',
  aliases: ['owner', 'painel', 'adm'],

  async execute({ client, from, info, prefix, reply, isDono, args }) {
    if (!isDono) {
      return reply('❌ Este comando é apenas para o dono do bot!')
    }

    const p = prefix || '.'
    const sub = (args[0] || '').toLowerCase()

    // .dono grupos — lista ativos
    if (sub === 'grupos' || sub === 'listar') {
      const list = db.listActiveGroups()
      if (!list.length) return reply('📭 Nenhum grupo ativo no momento.')
      let text = `📋 *Grupos ativos (${list.length})*\n\n`
      for (const g of list.slice(0, 30)) {
        text += `• \`${g.id}\`\n  expira: ${formatDate(g.expires)}\n`
      }
      return reply(text)
    }

    if (sub === 'status' && args[1]) {
      let id = args[1]
      if (!id.endsWith('@g.us')) id += '@g.us'
      const g = db.getGroup(id)
      if (!g) return reply('❌ Grupo não cadastrado.')
      return reply(
        `📊 *Status do grupo*\n\n` +
          `🆔 \`${id}\`\n` +
          `Ativo: ${g.active && g.expires > Date.now() ? '✅' : '❌'}\n` +
          `Expira: ${formatDate(g.expires)}\n` +
          `Dias config.: ${g.days || '—'}`
      )
    }

    const menu = `
╭─────────────────────────────╮
│  🩸  *NYX — PAINEL DO DONO*  │
╰─────────────────────────────╯

🧊 *ALUGUEL / GRUPOS*
│
├ ${p}ativar_grupo [dias]
│   ↳ Ativa o grupo atual (padrão 30 dias)
├ ${p}ativar_grupo <id> [dias]
│   ↳ Ativa pelo ID do grupo
├ ${p}reativar [dias|1m|2h]
│   ↳ Renova o aluguel
├ ${p}desativar_grupo
│   ↳ Esquece este grupo
├ ${p}desativar_grupo todos
│   ↳ Esquece todos os grupos
├ ${p}dono grupos
│   ↳ Lista grupos ativos
└ ${p}dono status <id>
    ↳ Status de um grupo

📋 *STATUS E LOGS*
│
├ ${p}status
│   ↳ Status do bot
└ ${p}logs
    ↳ Logs recentes

⚙️ *CONFIGURAÇÕES*
│
├ ${p}setprefix [novo]
│   ↳ Prefixo global
└ ${p}setnome [nome]
    ↳ Nome do bot

🔄 *SISTEMA*
│
├ ${p}sair
│   ↳ Bot sai do grupo atual
└ ${p}broadcast [msg]
    ↳ Mensagem para grupos ativos

💰 *PREMIUM*
│
├ ${p}addpremium [número]
├ ${p}removepremium [número]
└ ${p}listpremium

🔧 *DEV*
│
├ ${p}restart
└ ${p}eval <código>

╭─────────────────────────────╮
│  ⚠️  Uso exclusivo do dono   │
╰─────────────────────────────╯
`.trim()

    await reply(menu)
  }
}
