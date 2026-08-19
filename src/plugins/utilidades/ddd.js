const axios = require('axios')

module.exports = {
  name: 'ddd',
  description: 'Consulta DDD',
  category: 'utilidades',
  aliases: ['estado'],
  async execute({ reply, reagir, q }) {
    const ddd = (q || '').replace(/\D/g, '')
    if (ddd.length !== 2) return reply('❗ Use: .ddd 11')
    try {
      await reagir('📞')
      const { data } = await axios.get(`https://brasilapi.com.br/api/ddd/v1/${ddd}`)
      reply(`📞 *DDD ${ddd}*\n\nEstado: ${data.state}\nCidades: ${data.cities.slice(0, 15).join(', ')}${data.cities.length > 15 ? '...' : ''}`)
    } catch {
      reply('❌ DDD não encontrado.')
    }
  }
}
