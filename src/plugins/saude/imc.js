'use strict'
module.exports = {
  name: 'imc',
  description: 'Calcula IMC',
  category: 'saude',
  aliases: ['calculaimc'],
  cooldown: 3,
  async execute({ reply, reagir, args, prefix }) {
    await reagir('🩺')
    const p = prefix || '.'
    const peso = parseFloat(String(args[0] || '').replace(',', '.'))
    const altura = parseFloat(String(args[1] || '').replace(',', '.'))
    if (!peso || !altura) return reply(`🩺 Uso: *${p}imc 70 1.75*`)
    const imc = peso / (altura * altura)
    let c = 'Obesidade'
    if (imc < 18.5) c = 'Abaixo do peso'
    else if (imc < 25) c = 'Peso normal'
    else if (imc < 30) c = 'Sobrepeso'
    await reply(`🩺 IMC *${imc.toFixed(1)}* — ${c}`)
  }
}
