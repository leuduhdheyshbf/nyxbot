const fs = require('fs')
const PATH = './database/autoreply.json'

function load(){try{if(fs.existsSync(PATH))return JSON.parse(fs.readFileSync(PATH))}catch{}return{}}
function save(d){fs.writeFileSync(PATH,JSON.stringify(d,null,2))}

module.exports = {
  name: 'autoreply',
  description: 'Configura auto-resposta por palavra',
  category: 'utilidades',
  aliases: ['autoresposta', 'auto'],
  async execute({ reply, reagir, isGroup, isAdm, isDono, args, from, q }) {
    if (!isGroup) return reply('❌ Só em grupos.')
    if (!isAdm && !isDono) return reply('❌ Só admins.')
    const data = load()
    if (!data[from]) data[from] = {}
    const cmd = (args[0]||'').toLowerCase()

    if (cmd==='add') {
      // .autoreply add palavra | resposta
      const rest = args.slice(1).join(' ')
      const parts = rest.split('|').map(s=>s.trim())
      if (parts.length < 2) return reply('❗ Use: .autoreply add palavra | resposta')
      data[from][parts[0].toLowerCase()] = parts[1]
      save(data)
      await reagir('✅')
      return reply(`✅ Auto-resposta:\n*${parts[0]}* → ${parts[1]}`)
    }
    if (cmd==='del' && args[1]) {
      delete data[from][args.slice(1).join(' ').toLowerCase()]
      save(data)
      return reply('✅ Removida.')
    }
    if (cmd==='list') {
      const entries = Object.entries(data[from]||{})
      if (!entries.length) return reply('Nenhuma auto-resposta.')
      return reply('📋 *Auto-respostas*\n\n' + entries.map(([k,v])=>`• ${k} → ${v}`).join('\n'))
    }
    reply(`.autoreply add palavra | resposta\n.autoreply del palavra\n.autoreply list`)
  }
}
