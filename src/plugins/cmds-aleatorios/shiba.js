const axios = require('axios')
module.exports = {
  name: 'shiba',
  description: 'Foto de shiba',
  category: 'cmds-aleatorios',
  aliases: ['shibe'],
  async execute({ nyx, from, info, reply, reagir }) {
    try {
      await reagir('🐕')
      const { data } = await axios.get('https://shibe.online/api/shibes?count=1', { timeout: 10000 })
      await nyx.sendMessage(from, { image: { url: data[0] }, caption: '🐕 Shiba!' }, { quoted: info })
    } catch { reply('❌ Erro shiba.') }
  }
}
