const axios = require('axios')
module.exports = {
  name: 'gato',
  description: 'Foto de gato',
  category: 'cmds-aleatorios',
  aliases: ['cat', 'miau'],
  async execute({ nyx, from, info, reply, reagir }) {
    try {
      await reagir('🐱')
      const { data } = await axios.get('https://api.thecatapi.com/v1/images/search', { timeout: 10000 })
      const url = data?.[0]?.url
      if (!url) return reply('❌ Sem gato agora.')
      await nyx.sendMessage(from, { image: { url }, caption: '🐱 Miau!' }, { quoted: info })
    } catch { reply('❌ Erro ao buscar gato.') }
  }
}
