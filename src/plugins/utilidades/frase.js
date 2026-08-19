const axios = require('axios')
module.exports = {
  name: 'frase',
  description: 'Frase motivacional',
  category: 'utilidades',
  aliases: ['quote', 'citacao'],
  async execute({ reply, reagir }) {
    try {
      await reagir('💭')
      const { data } = await axios.get('https://api.quotable.io/random', { timeout: 10000 })
      reply(`💭 *"${data.content}"*\n— ${data.author}`)
    } catch {
      try {
        const { data } = await axios.get('https://dummyjson.com/quotes/random', { timeout: 10000 })
        reply(`💭 *"${data.quote}"*\n— ${data.author}`)
      } catch { reply('❌ Sem frase agora.') }
    }
  }
}
