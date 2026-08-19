const axios = require('axios')
module.exports = {
  name: 'wink',
  description: 'Piscadinha anime',
  category: 'cmds-aleatorios',
  aliases: ['piscar'],
  async execute({ client, from, info, reply, reagir }) {
    await reagir('😉')
    try {
      const { data } = await axios.get('https://api.waifu.pics/sfw/wink', { timeout: 10000 })
      await client.sendMessage(from, { video: { url: data.url }, gifPlayback: true, caption: '😉' }, { quoted: info })
    } catch (e) { reply('❌ ' + e.message) }
  }
}
