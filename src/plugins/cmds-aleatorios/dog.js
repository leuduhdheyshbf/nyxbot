const axios = require('axios')
module.exports = {
  name: 'dog',
  description: 'Foto aleatória de cachorro',
  category: 'cmds-aleatorios',
  aliases: ['doggo'],
  async execute({ client, from, info, reply, reagir }) {
    await reagir('🐶')
    try {
      const { data } = await axios.get('https://dog.ceo/api/breeds/image/random', { timeout: 10000 })
      await client.sendMessage(from, { image: { url: data.message }, caption: '🐶' }, { quoted: info })
    } catch (e) { reply('❌ ' + e.message) }
  }
}
