const axios = require('axios')
module.exports = {
  name: 'wave',
  description: 'Acenar anime',
  category: 'cmds-aleatorios',
  aliases: ['acenar'],
  async execute({ client, from, info, reply, reagir }) {
    await reagir('👋')
    try {
      const { data } = await axios.get('https://api.waifu.pics/sfw/wave', { timeout: 10000 })
      await client.sendMessage(from, { video: { url: data.url }, gifPlayback: true, caption: '👋' }, { quoted: info })
    } catch (e) { reply('❌ ' + e.message) }
  }
}
