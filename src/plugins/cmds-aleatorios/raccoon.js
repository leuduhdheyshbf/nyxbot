const axios = require('axios')
module.exports = {
  name: 'raccoon',
  description: 'Foto de guaxinim',
  category: 'cmds-aleatorios',
  aliases: ['guaxinim'],
  async execute({ client, from, info, reply, reagir }) {
    await reagir('🦝')
    try {
      const { data } = await axios.get('https://some-random-api.com/animal/raccoon', { timeout: 10000 })
      await client.sendMessage(from, { image: { url: data.image }, caption: '🦝' }, { quoted: info })
    } catch (e) { reply('❌ ' + e.message) }
  }
}
