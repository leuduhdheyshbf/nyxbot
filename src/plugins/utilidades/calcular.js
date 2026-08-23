module.exports = {
  name: 'calcular',
  description: 'Calculadora',
  category: 'utilidades',
  aliases: ['calc', 'calcule'],
  async execute({ reply, reagir, q }) {
    if (!q) return reply('❗ Use: .calcular 2+2*5')
    try {
      await reagir('🧮')
      // só números e operadores básicos
      if (!/^[0-9+\-*/().\s]+$/.test(q)) return reply('❌ Só números e + - * / ( )')
      const result = Function(`"use strict"; return (${q})`)()
      reply(`🧮 ${q} = *${result}*`)
    } catch {
      reply('❌ Conta inválida.')
    }
  }
}
