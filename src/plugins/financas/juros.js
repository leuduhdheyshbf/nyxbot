'use strict'
module.exports = {
  name: 'juros',
  description: 'Juros compostos',
  category: 'financas',
  aliases: ['juroscompostos'],
  cooldown: 3,
  async execute({ reply, reagir, args, prefix }) {
    await reagir('💰')
    const p = prefix || '.'
    const capital = parseFloat(String(args[0] || '').replace(',', '.'))
    const taxa = parseFloat(String(args[1] || '').replace(',', '.'))
    const meses = parseInt(args[2], 10)
    if (![capital, taxa, meses].every(n => !isNaN(n) && n > 0))
      return reply(`💰 Uso: *${p}juros 1000 1 12*`)
    const final = capital * Math.pow(1 + taxa / 100, meses)
    await reply(`💰 Montante: *R$ ${final.toFixed(2)}*\nLucro: *R$ ${(final-capital).toFixed(2)}*`)
  }
}
