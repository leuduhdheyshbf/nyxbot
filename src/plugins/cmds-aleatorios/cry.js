const axios = require('axios')
module.exports = {
  name: 'cry',
  description: 'Imagem de choro anime',
  category: 'cmds-aleatorios',
  aliases: ['choro'],
  async execute({ client, from, info, reply, reagir }) {
    await reagir('😢')
    try {
      const { data } = await axios.get('https://api.waifu.pics/sfw/cry', { timeout: 10000 })
      await client.sendMessage(from, { image: { url: data.url }, caption: '😢' }, { quoted: info })
    } catch (e) { reply('❌ ' + e.message) }
  }
}
