const axios = require('axios')
module.exports = {
  name: 'kangaroo',
  description: 'Foto de canguru',
  category: 'cmds-aleatorios',
  aliases: ['canguru'],
  async execute({ client, from, info, reply, reagir }) {
    await reagir('🦘')
    try {
      const { data } = await axios.get('https://some-random-api.com/animal/kangaroo', { timeout: 10000 })
      await client.sendMessage(from, { image: { url: data.image }, caption: '🦘' }, { quoted: info })
    } catch (e) { reply('❌ ' + e.message) }
  }
}
