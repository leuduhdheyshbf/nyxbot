const axios = require('axios')
module.exports = {
  name: 'happy',
  description: 'Imagem feliz anime',
  category: 'cmds-aleatorios',
  aliases: ['feliz'],
  async execute({ client, from, info, reply, reagir }) {
    await reagir('😊')
    try {
      const { data } = await axios.get('https://api.waifu.pics/sfw/happy', { timeout: 10000 })
      await client.sendMessage(from, { video: { url: data.url }, gifPlayback: true, caption: '😊' }, { quoted: info })
    } catch (e) { reply('❌ ' + e.message) }
  }
}
