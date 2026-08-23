const axios = require('axios')
module.exports = {
  name: 'neko',
  description: 'Neko SFW aleatória',
  category: 'cmds-aleatorios',
  aliases: [],
  async execute({ client, from, info, reply, reagir }) {
    await reagir('😺')
    try {
      const { data } = await axios.get('https://api.waifu.pics/sfw/neko', { timeout: 10000 })
      await client.sendMessage(from, { image: { url: data.url }, caption: '😺' }, { quoted: info })
    } catch (e) { reply('❌ ' + e.message) }
  }
}
