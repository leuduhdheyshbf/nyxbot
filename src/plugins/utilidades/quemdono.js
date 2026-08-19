const fs = require('fs')

module.exports = {
  name: 'dono',
  description: 'Mostra info do dono do bot',
  category: 'utilidades',
  aliases: ['criador', 'owner'],
  async execute({ reply, reagir }) {
    const config = JSON.parse(fs.readFileSync('./database/config.json'))
    await reagir('👑')
    reply(`👑 *Dono do Bot*\n\nNome: ${config.NomeDoDono}\nNúmero: ${config.NumeroDoDono}\nBot: ${config.NomeDoBot}`)
  }
}
