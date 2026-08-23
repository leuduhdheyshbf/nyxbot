const fs = require('fs')

module.exports = {
  name: 'setprefix',
  description: 'Muda o prefixo do bot',
  category: 'dono',
  aliases: ['prefixo'],
  async execute({ reply, reagir, isDono, args }) {
    if (!isDono) return reply('❌ Só o dono.')
    const novo = args[0]
    if (!novo || novo.length > 3) return reply('❗ Use: .setprefix !\n(máx 3 caracteres)')
    try {
      const config = JSON.parse(fs.readFileSync('./database/config.json'))
      config.prefix = novo
      fs.writeFileSync('./database/config.json', JSON.stringify(config, null, 2))
      await reagir('✅')
      reply(`✅ Prefixo alterado para: *${novo}*\nExemplo: ${novo}menu`)
    } catch {
      reply('❌ Erro ao salvar.')
    }
  }
}
