'use strict'

const db = require('../../core/database')

function formatDate(ts) {
  return new Date(ts).toLocaleString('pt-BR', { timeZone: 'America/Sao_Paulo' })
}

module.exports = {
  name: 'reativar',
  description: 'Reativa / renova o aluguel de um grupo',
  category: 'admin',
  aliases: ['renovar', 'renovar_grupo'],
  ownerOnly: true,

  async execute({ from, args, reply, isDono, sender, prefix }) {
    if (!isDono) return reply('❌ Apenas o dono do bot pode usar este comando.')

    let groupId = null
    let dias = 30

    if (args[0] && String(args[0]).includes('@g.us')) {
      groupId = args[0]
      if (args[1]) dias = parseInt(args[1], 10) || 30
    } else if (from.endsWith('@g.us')) {
      groupId = from
      if (args[0]) dias = parseInt(args[0], 10) || 30
    } else if (args[0]) {
      groupId = args[0].endsWith('@g.us') ? args[0] : args[0] + '@g.us'
      if (args[1]) dias = parseInt(args[1], 10) || 30
    }

    if (!groupId || !groupId.endsWith('@g.us')) {
      return reply(
        `📌 *Uso:*\n*${prefix}reativar* [dias]\n*${prefix}reativar* <id_grupo> [dias]`
      )
    }

    if (dias < 1 || dias > 3650) {
      return reply('⚠️ Dias inválidos. Use entre 1 e 3650.')
    }

    const prev = db.getGroup(groupId)
    const data = db.activateGroup(groupId, dias, sender)

    await reply(
      `🔄 *Grupo reativado!*\n\n` +
        `🆔 \`${groupId}\`\n` +
        `📅 +*${data.days}* dias\n` +
        `⏰ Nova expiração: *${formatDate(data.expires)}*\n` +
        (prev ? `(antes: ${prev.active ? 'ativo' : 'inativo'})` : '')
    )
  }
}
