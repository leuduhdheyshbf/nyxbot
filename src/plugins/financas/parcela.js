'use strict'
module.exports = {
  name: 'parcela',
  description: 'Divide em parcelas',
  category: 'financas',
  aliases: ['parcelar'],
  cooldown: 3,
  async execute({ reply, reagir, args, prefix }) {
    await reagir('🧾')
    const p = prefix || '.'
    const total = parseFloat(String(args[0] || '').replace(',', '.'))
    const n = parseInt(args[1], 10)
    if (!total || !n) return reply(`🧾 Uso: *${p}parcela 1200 10*`)
    await reply(`🧾 ${n}x de *R$ ${(total/n).toFixed(2)}*`)
  }
}
