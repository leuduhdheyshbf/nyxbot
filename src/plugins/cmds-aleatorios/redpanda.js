const axios = require('axios')
module.exports = {
  name: 'redpanda',
  description: 'Foto de red panda',
  category: 'cmds-aleatorios',
  aliases: ['redp'],
  async execute({ client, from, info, reply, reagir }) {
    await reagir('🔴')
    try {
      const { data } = await axios.get('https://some-random-api.com/animal/red_panda', { timeout: 10000 })
      await client.sendMessage(from, { image: { url: data.image }, caption: '🔴🐼' }, { quoted: info })
    } catch (e) { reply('❌ ' + e.message) }
  }
}
