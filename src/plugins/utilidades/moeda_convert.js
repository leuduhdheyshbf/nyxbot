module.exports = {
  name: 'converter',
  description: 'Conversão simples BRL/USD (cotação aproximada via API)',
  category: 'utilidades',
  aliases: ['convert'],
  async execute({ reply, reagir, args }) {
    const valor = parseFloat(args[0])
    const de = (args[1] || 'USD').toUpperCase()
    const para = (args[2] || 'BRL').toUpperCase()
    if (!valor) return reply('❗ Use: .converter 10 USD BRL')
    await reagir('💱')
    try {
      const axios = require('axios')
      const { data } = await axios.get(`https://open.er-api.com/v6/latest/${de}`, { timeout: 10000 })
      const rate = data?.rates?.[para]
      if (!rate) return reply('❌ Moeda não encontrada.')
      await reply(`💱 ${valor} ${de} = *${(valor * rate).toFixed(2)} ${para}*`)
    } catch (e) {
      await reply('❌ Erro na cotação: ' + e.message)
    }
  }
}
