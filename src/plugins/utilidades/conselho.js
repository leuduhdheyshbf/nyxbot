const axios = require('axios')
module.exports = {
  name: 'conselho',
  description: 'Conselho aleatório',
  category: 'utilidades',
  aliases: ['advice'],
  async execute({ reply, reagir }) {
    try {
      await reagir('💡')
      const { data } = await axios.get('https://api.adviceslip.com/advice', { timeout: 10000 })
      reply(`💡 *Conselho:*\n${data.slip.advice}`)
    } catch { reply('❌ Sem conselho agora.') }
  }
}
