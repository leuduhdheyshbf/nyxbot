const fs = require('fs')

module.exports = {
  name: 'setnome',
  description: 'Muda o nome do bot',
  category: 'dono',
  aliases: ['setbotname'],
  async execute({ reply, reagir, isDono, q }) {
    if (!isDono) return reply('❌ Só o dono.')
    if (!q) return reply('❗ Use: .setnome Nome do Bot')
    try {
      const config = JSON.parse(fs.readFileSync('./database/config.json'))
      config.NomeDoBot = q
      fs.writeFileSync('./database/config.json', JSON.stringify(config, null, 2))
      await reagir('✅')
      reply(`✅ Nome do bot: *${q}*`)
    } catch {
      reply('❌ Erro.')
    }
  }
}
