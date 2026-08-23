const axios = require('axios')
module.exports = {
  name: 'fato',
  description: 'Fato aleatório',
  category: 'utilidades',
  aliases: ['fact', 'curiosidade'],
  async execute({ reply, reagir }) {
    try {
      await reagir('🧠')
      const { data } = await axios.get('https://uselessfacts.jsph.pl/api/v2/facts/random', { timeout: 10000 })
      reply(`🧠 *Fato:*\n${data.text}`)
    } catch { reply('❌ Sem fato agora.') }
  }
}
