const fs = require('fs')
const PATH = './database/features.json'
function load(){try{if(fs.existsSync(PATH))return JSON.parse(fs.readFileSync(PATH))}catch{}return{}}
function save(d){fs.writeFileSync(PATH,JSON.stringify(d,null,2))}

module.exports = {
  name: 'antifake',
  description: 'Bloqueia números de fora do Brasil (55)',
  category: 'admin',
  aliases: ['antifalse'],
  async execute({ reply, reagir, isGroup, isAdm, isDono, args }) {
    if (!isGroup) return reply('❌ Só em grupos.')
    if (!isAdm && !isDono) return reply('❌ Só admins.')
    const f = load()
    const a = (args[0]||'').toLowerCase()
    if (a==='on'||a==='ligar'){ f.antifake=true; save(f); await reagir('✅'); return reply('✅ Antifake ativado!\nNúmeros que não começam com 55 serão removidos ao entrar.') }
    if (a==='off'||a==='desligar'){ f.antifake=false; save(f); await reagir('✅'); return reply('❌ Antifake desativado.') }
    reply(`🛡️ Antifake: ${f.antifake?'✅ On':'❌ Off'}\nUso: .antifake on/off`)
  }
}
