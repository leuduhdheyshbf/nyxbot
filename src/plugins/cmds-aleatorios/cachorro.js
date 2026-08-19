const axios = require('axios')
module.exports = {
  name: 'cachorro',
  description: 'Foto de cachorro',
  category: 'cmds-aleatorios',
  aliases: ['dog', 'auau'],
  async execute({ nyx, from, info, reply, reagir }) {
    try {
      await reagir('🐶')
      const { data } = await axios.get('https://dog.ceo/api/breeds/image/random', { timeout: 10000 })
      await nyx.sendMessage(from, { image: { url: data.message }, caption: '🐶 Au au!' }, { quoted: info })
    } catch { reply('❌ Erro ao buscar cachorro.') }
  }
}
