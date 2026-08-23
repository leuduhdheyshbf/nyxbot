'use strict'

const db = require('../../core/database')

module.exports = {
  name: 'desativar_grupo',
  description: 'Desativa / esquece o aluguel de um grupo',
  category: 'admin',
  aliases: ['desativar', 'esquecer_grupo', 'remover_grupo'],
  ownerOnly: true,

  async execute({ from, args, reply, isDono, prefix }) {
    if (!isDono) return reply('❌ Apenas o dono do bot pode usar este comando.')

    const sub = (args[0] || '').toLowerCase()

    // .desativar_grupo todos  → limpa todos
    if (sub === 'todos' || sub === 'all' || sub === 'tudo') {
      const groups = db.load('groups')
      const qtd = Object.keys(groups).length
      for (const k of Object.keys(groups)) delete groups[k]
      db.markDirty('groups')
      db.flush()
      return reply(`🗑️ *${qtd}* grupo(s) removido(s) da lista de aluguel.\nPode ativar de novo com *${prefix}ativar_grupo*.`)
    }

    let groupId = null
    if (args[0] && String(args[0]).includes('@g.us')) {
      groupId = args[0]
    } else if (from.endsWith('@g.us') && (!args[0] || args[0] === 'este')) {
      groupId = from
    } else if (args[0]) {
      groupId = args[0].endsWith('@g.us') ? args[0] : args[0] + '@g.us'
    }

    if (!groupId || !groupId.endsWith('@g.us')) {
      return reply(
        `📌 *Uso:*\n` +
          `• No grupo: *${prefix}desativar_grupo*\n` +
          `• Por ID: *${prefix}desativar_grupo* <id>\n` +
          `• Limpar tudo: *${prefix}desativar_grupo todos*`
      )
    }

    const groups = db.load('groups')
    if (!groups[groupId]) {
      return reply('ℹ️ Este grupo não estava na lista de aluguel.')
    }

    delete groups[groupId]
    db.markDirty('groups')
    db.flush()

    await reply(
      `🗑️ Grupo esquecido/desativado:\n\`${groupId}\`\n\n` +
        `Pode ativar de novo com *${prefix}ativar_grupo*.`
    )
  }
}
