const axios = require('axios')
module.exports = {
  name: 'bird',
  description: 'Foto aleatória de pássaro',
  category: 'cmds-aleatorios',
  aliases: ['passaro'],
  async execute({ client, from, info, reply, reagir }) {
    await reagir('🐦')
    try {
      const { data } = await axios.get('https://api.obipiran.ir/v1/animals/bird', { timeout: 10000 }).catch(() => null)
      // fallback picsum style not bird - use some-random-api
      const r = await axios.get('https://some-random-api.com/animal/bird', { timeout: 10000 })
      await client.sendMessage(from, { image: { url: r.data.image }, caption: '🐦 ' + (r.data.fact || '') }, { quoted: info })
    } catch (e) { reply('❌ ' + e.message) }
  }
}
