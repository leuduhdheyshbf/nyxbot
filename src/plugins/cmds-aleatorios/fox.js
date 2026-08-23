const axios = require('axios')
module.exports = {
  name: 'fox',
  description: 'Foto aleatória de raposa',
  category: 'cmds-aleatorios',
  aliases: ['foximg'],
  async execute({ client, from, info, reply, reagir }) {
    await reagir('🦊')
    try {
      const { data } = await axios.get('https://randomfox.ca/floof/', { timeout: 10000 })
      await client.sendMessage(from, { image: { url: data.image }, caption: '🦊' }, { quoted: info })
    } catch (e) { reply('❌ ' + e.message) }
  }
}
