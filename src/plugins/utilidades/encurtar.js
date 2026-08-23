const axios = require('axios')
module.exports = {
  name: 'encurtar',
  description: 'Encurta URL',
  category: 'utilidades',
  aliases: ['short', 'shorturl'],
  async execute({ reply, reagir, q }) {
    if (!q || !q.startsWith('http')) return reply('❗ Use: .encurtar https://...')
    try {
      await reagir('🔗')
      const { data } = await axios.get(`https://is.gd/create.php?format=simple&url=${encodeURIComponent(q)}`, { timeout: 10000 })
      if (!data || data.includes('Error')) return reply('❌ Não foi possível encurtar.')
      reply(`🔗 *Link curto:*\n${data}`)
    } catch { reply('❌ Erro ao encurtar.') }
  }
}
