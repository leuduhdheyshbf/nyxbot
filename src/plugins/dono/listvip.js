'use strict'

const db = require('../../core/database')

module.exports = {
  name: 'listvip',
  description: 'Lista usuários VIP/premium',
  category: 'dono',
  aliases: ['listpremium', 'vips'],
  dono: true,
  cooldown: 3,

  async execute({ reply }) {
    const list = db.listPremium()
    if (!list.length) return reply('💎 Nenhum VIP cadastrado.')
    const lines = list.map((j, i) => `${i + 1}. @${j.split('@')[0]}`)
    await reply(`💎 *VIP/Premium (${list.length})*\n\n` + lines.join('\n'), {
      mentions: list
    })
  }
}
