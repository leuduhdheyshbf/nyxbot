const axios = require('axios')
module.exports = {
  name: 'waifu',
  description: 'Waifu SFW',
  category: 'cmds-aleatorios',
  aliases: ['neko'],
  async execute({ nyx, from, info, reply, reagir, command }) {
    try {
      await reagir('✨')
      const tipo = command === 'neko' ? 'neko' : 'waifu'
      const { data } = await axios.get(`https://api.waifu.pics/sfw/${tipo}`, { timeout: 10000 })
      await nyx.sendMessage(from, { image: { url: data.url }, caption: `✨ ${tipo}` }, { quoted: info })
    } catch { reply('❌ Erro waifu.') }
  }
}
