const fs = require('fs')
const PATH = './database/mutes.json'
function load(){try{if(fs.existsSync(PATH))return JSON.parse(fs.readFileSync(PATH))}catch{}return{}}
function save(d){fs.writeFileSync(PATH,JSON.stringify(d,null,2))}

module.exports = {
  name: 'mutetempo',
  description: 'Silencia por X minutos',
  category: 'admin',
  aliases: ['tempmute', 'mutet'],
  async execute({ nyx, from, info, reply, reagir, isGroup, isAdm, isDono, args }) {
    if (!isGroup) return reply('❌ Só em grupos.')
    if (!isAdm && !isDono) return reply('❌ Só admins.')

    const quoted = info.message?.extendedTextMessage?.contextInfo
    let target = quoted?.participant || quoted?.mentionedJid?.[0]
    const min = parseInt(args[0]) || parseInt(args[1])
    if (!target && args[0] && args[0].includes('@')) target = args[0].replace(/\D/g,'')+'@s.whatsapp.net'
    if (!target) return reply('❗ Marque alguém: .mutetempo 10 @pessoa')
    if (!min || min < 1 || min > 1440) return reply('❗ Minutos entre 1 e 1440.\nEx: .mutetempo 10 @pessoa')

    const data = load()
    if (!data[from]) data[from] = []
    if (!data[from].includes(target)) data[from].push(target)
    save(data)

    await reagir('🔇')
    await nyx.sendMessage(from, {
      text: `🔇 @${target.split('@')[0]} silenciado por *${min} min*`,
      mentions: [target]
    }, { quoted: info })

    setTimeout(() => {
      try {
        const d = load()
        if (d[from]) d[from] = d[from].filter(x => x !== target)
        save(d)
        nyx.sendMessage(from, {
          text: `🔊 @${target.split('@')[0]} pode falar de novo.`,
          mentions: [target]
        }).catch(()=>{})
      } catch {}
    }, min * 60 * 1000)
  }
}
