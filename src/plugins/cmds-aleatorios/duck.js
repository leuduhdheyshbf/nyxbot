const axios = require('axios')
module.exports = {
  name: 'pato',
  description: 'Foto de pato',
  category: 'cmds-aleatorios',
  aliases: ['duck'],
  async execute({ nyx, from, info, reply, reagir }) {
    try {
      await reagir('🦆')
      const { data } = await axios.get('https://random-d.uk/api/random', { timeout: 10000 })
      await nyx.sendMessage(from, { image: { url: data.url }, caption: '🦆' }, { quoted: info })
    } catch { reply('❌ Erro ao buscar pato.') }
  }
}
