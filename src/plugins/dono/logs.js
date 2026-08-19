const fs = require('fs')
const PATH = './database/logs.json'
function load(){try{if(fs.existsSync(PATH))return JSON.parse(fs.readFileSync(PATH))}catch{}return[]}

module.exports = {
  name: 'logs',
  description: 'Mostra últimos logs de moderação',
  category: 'dono',
  aliases: ['log'],
  async execute({ reply, reagir, isDono }) {
    if (!isDono) return reply('❌ Só o dono.')
    await reagir('📋')
    const logs = load().slice(-15)
    if (!logs.length) return reply('Nenhum log ainda.')
    reply('📋 *Últimos logs*\n\n' + logs.map(l => `• ${l}`).join('\n'))
  }
}
