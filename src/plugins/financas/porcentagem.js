'use strict'
module.exports = {
  name: 'porcentagem',
  description: 'Calcula %',
  category: 'financas',
  aliases: ['porcento', 'pct'],
  cooldown: 2,
  async execute({ reply, reagir, args, prefix }) {
    await reagir('📊')
    const p = prefix || '.'
    const pct = parseFloat(String(args[0] || '').replace(',', '.'))
    const valor = parseFloat(String(args[1] || '').replace(',', '.'))
    if (isNaN(pct) || isNaN(valor)) return reply(`📊 Uso: *${p}porcentagem 15 200*`)
    await reply(`📊 ${pct}% de ${valor} = *${((pct/100)*valor).toFixed(2)}*`)
  }
}
