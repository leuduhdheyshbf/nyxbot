const axios = require('axios')
module.exports = {
  name: 'piada',
  description: 'Piada aleatória',
  category: 'utilidades',
  aliases: ['joke', 'humor'],
  async execute({ reply, reagir }) {
    try {
      await reagir('🤣')
      const { data } = await axios.get('https://v2.jokeapi.dev/joke/Any?lang=en&safe-mode', { timeout: 10000 })
      if (data.type === 'two-part') reply(`🤣 ${data.setup}\n\n*${data.delivery}*`)
      else reply(`🤣 ${data.joke}`)
    } catch { reply('❌ Sem piada agora.') }
  }
}
