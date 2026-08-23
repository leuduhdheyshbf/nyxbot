'use strict'

module.exports = {
  name: 'saldo',
  description: 'Ver saldo de NyxCoins',
  category: 'utilidades',
  aliases: ['coins', 'balance', 'carteira'],
  cooldown: 3,
  async execute({ sender, reply, economy, config }) {
    const bal = economy.getBalance(sender)
    const sym = config.moeda?.simbolo || '🩸'
    await reply(`🩸 *Saldo*\n${sym} ${bal} ${config.moeda?.nome || 'NyxCoins'}`)
  }
}
