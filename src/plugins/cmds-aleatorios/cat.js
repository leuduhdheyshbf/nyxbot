const axios = require('axios')
module.exports = {
  name: 'cat',
  description: 'Foto aleatória de gato',
  category: 'cmds-aleatorios',
  aliases: ['catimg'],
  async execute({ client, from, info, reply, reagir }) {
    await reagir('🐱')
    try {
      const { data } = await axios.get('https://api.thecatapi.com/v1/images/search', { timeout: 10000 })
      await client.sendMessage(from, { image: { url: data[0].url }, caption: '🐱' }, { quoted: info })
    } catch (e) { reply('❌ ' + e.message) }
  }
}
