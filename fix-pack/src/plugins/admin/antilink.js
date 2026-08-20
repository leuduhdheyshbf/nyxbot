'use strict'

const db = require('../../core/database')

module.exports = {
  name: 'antilink',
  description: 'Liga/desliga antilink no grupo',
  category: 'admin',
  aliases: ['antlink'],

  async execute({ reply, reagir, isGroup, isAdm, isDono, args, prefix }) {
    if (!isGroup) return reply('❌ Só em grupos.')
    if (!isAdm && !isDono) return reply('❌ Só administradores.')

    const action = (args[0] || '').toLowerCase()
    const p = prefix || '.'

    if (action === 'on' || action === 'ligar' || action === '1') {
      await db.setFeature('antilink', true)
      if (typeof reagir === 'function') await reagir('✅')
      return reply('✅ *Antilink ativado!*\nLinks de não-admins serão apagados.')
    }

    if (action === 'off' || action === 'desligar' || action === '0') {
      await db.setFeature('antilink', false)
      if (typeof reagir === 'function') await reagir('✅')
      return reply('❌ *Antilink desativado.*')
    }

    const feats = db.getFeatures()
    const status = feats.antilink ? '✅ Ativado' : '❌ Desativado'
    return reply(
      `🔗 *Antilink*\n\nStatus: ${status}\n\nUso:\n▸ \`${p}antilink on\`\n▸ \`${p}antilink off\``
    )
  }
}
