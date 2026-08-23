const axios = require('axios')
module.exports = {
  name: 'dance',
  description: 'Imagem de dança anime',
  category: 'cmds-aleatorios',
  aliases: ['danca'],
  async execute({ client, from, info, reply, reagir }) {
    await reagir('💃')
    try {
      const { data } = await axios.get('https://api.waifu.pics/sfw/dance', { timeout: 10000 })
      await client.sendMessage(from, { video: { url: data.url }, gifPlayback: true, caption: '💃' }, { quoted: info })
    } catch (e) { reply('❌ ' + e.message) }
  }
}
