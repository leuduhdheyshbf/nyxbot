const axios = require('axios')
module.exports = {
  name: 'coffee',
  description: 'Imagem aleatória de café',
  category: 'cmds-aleatorios',
  aliases: ['cafe'],
  async execute({ client, from, info, reply, reagir }) {
    await reagir('☕')
    try {
      const { data } = await axios.get('https://coffee.alexandergrahn.com/random.json', { timeout: 10000 }).catch(() => null)
      const url = data?.file || 'https://coffee.alexandergrahn.com/random'
      await client.sendMessage(from, { image: { url }, caption: '☕' }, { quoted: info })
    } catch (e) {
      try {
        await client.sendMessage(from, { image: { url: 'https://picsum.photos/500' }, caption: '☕ (fallback)' }, { quoted: info })
      } catch (e2) { reply('❌ ' + e2.message) }
    }
  }
}
