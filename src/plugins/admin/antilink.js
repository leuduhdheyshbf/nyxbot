'use strict'

const db = require('../../core/database')

module.exports = {
  name: 'antilink',
  description: 'Liga/desliga antilink neste grupo',
  category: 'admin',
  aliases: ['antlink'],

  async execute({ reply, reagir, isGroup, isAdm, isDono, args, prefix, from }) {
    if (!isGroup) return reply('❌ Só em grupos.')
    if (!isAdm && !isDono) return reply('❌ Só administradores.')

    const action = (args[0] || '').toLowerCase()
    const p = prefix || '.'

    if (action === 'on' || action === 'ligar' || action === '1') {
      await db.setGroupFeature(from, 'antilink', true)
      // mantém flag global também (compat / fallback)
      try { await db.setFeature('antilink', true) } catch {}
      if (typeof reagir === 'function') await reagir('✅')
      return reply('✅ *Antilink ativado!*\nLinks de não-admins serão apagados neste grupo.')
    }

    if (action === 'off' || action === 'desligar' || action === '0') {
      await db.setGroupFeature(from, 'antilink', false)
      if (typeof reagir === 'function') await reagir('✅')
      return reply('❌ *Antilink desativado neste grupo.*')
    }

    const on = db.getGroupFeature(from, 'antilink')
    const status = on ? '✅ Ativado' : '❌ Desativado'
    return reply(
      `🔗 *Antilink*\n\nStatus neste grupo: ${status}\n\nUso:\n▸ \`${p}antilink on\`\n▸ \`${p}antilink off\``
    )
  }
}
