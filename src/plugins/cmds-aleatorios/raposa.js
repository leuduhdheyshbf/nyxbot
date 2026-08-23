const axios = require('axios')
module.exports = {
  name: 'raposa',
  description: 'Foto de raposa',
  category: 'cmds-aleatorios',
  aliases: ['fox'],
  async execute({ nyx, from, info, reply, reagir }) {
    try {
      await reagir('🦊')
      const { data } = await axios.get('https://randomfox.ca/floof/', { timeout: 10000 })
      await nyx.sendMessage(from, { image: { url: data.image }, caption: '🦊' }, { quoted: info })
    } catch { reply('❌ Erro ao buscar raposa.') }
  }
}
