const fs = require('fs')
const PATH = './database/features.json'
function load(){try{if(fs.existsSync(PATH))return JSON.parse(fs.readFileSync(PATH))}catch{}return{}}
function save(d){fs.writeFileSync(PATH,JSON.stringify(d,null,2))}

module.exports = {
  name: 'antiflood',
  description: 'Liga/desliga antiflood',
  category: 'admin',
  aliases: ['antispam'],
  async execute({ reply, reagir, isGroup, isAdm, isDono, args }) {
    if (!isGroup) return reply('❌ Só em grupos.')
    if (!isAdm && !isDono) return reply('❌ Só admins.')
    const f = load()
    const a = (args[0]||'').toLowerCase()
    if (a==='on'||a==='ligar'){ f.antiflood=true; save(f); await reagir('✅'); return reply('✅ Antiflood ativado!') }
    if (a==='off'||a==='desligar'){ f.antiflood=false; save(f); await reagir('✅'); return reply('❌ Antiflood desativado.') }
    reply(`🛡️ Antiflood: ${f.antiflood?'✅ On':'❌ Off'}\nUso: .antiflood on/off`)
  }
}
