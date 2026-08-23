const fs = require('fs')
const PATH = './database/badwords.json'

function load(){try{if(fs.existsSync(PATH))return JSON.parse(fs.readFileSync(PATH))}catch{}return{words:[],enabled:{}}}
function save(d){fs.writeFileSync(PATH,JSON.stringify(d,null,2))}

module.exports = {
  name: 'antiproc',
  description: 'Anti palavras proibidas',
  category: 'admin',
  aliases: ['antiproc', 'antiprocura', 'badword'],
  async execute({ reply, reagir, isGroup, isAdm, isDono, args, from }) {
    if (!isGroup) return reply('❌ Só em grupos.')
    if (!isAdm && !isDono) return reply('❌ Só admins.')
    const data = load()
    const cmd = (args[0]||'').toLowerCase()

    if (cmd==='on'){ data.enabled[from]=true; save(data); await reagir('✅'); return reply('✅ Anti-palavra ativado!') }
    if (cmd==='off'){ data.enabled[from]=false; save(data); await reagir('✅'); return reply('❌ Anti-palavra desativado.') }
    if (cmd==='add' && args[1]){ data.words.push(args.slice(1).join(' ').toLowerCase()); save(data); return reply(`✅ Palavra adicionada.`) }
    if (cmd==='del' && args[1]){ const w=args.slice(1).join(' ').toLowerCase(); data.words=data.words.filter(x=>x!==w); save(data); return reply(`✅ Removida.`) }
    if (cmd==='list'){ return reply(`📋 Palavras: ${data.words.join(', ')||'nenhuma'}`) }

    reply(`🚫 *Anti-palavra*\nStatus: ${data.enabled[from]?'✅':'❌'}\n\n.antiproc on/off\n.antiproc add palavra\n.antiproc del palavra\n.antiproc list`)
  }
}
