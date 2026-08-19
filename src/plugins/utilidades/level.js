const fs = require('fs')
const PATH = './database/xp.json'

function load(){try{if(fs.existsSync(PATH))return JSON.parse(fs.readFileSync(PATH))}catch{}return{}}
function xpNeeded(level){ return level * 100 }

module.exports = {
  name: 'level',
  description: 'Mostra seu level/XP',
  category: 'utilidades',
  aliases: ['xp', 'nivel'],
  async execute({ reply, reagir, sender, info }) {
    await reagir('⭐')
    const data = load()
    const quoted = info.message?.extendedTextMessage?.contextInfo
    const target = quoted?.participant || quoted?.mentionedJid?.[0] || sender
    const user = data[target] || { xp: 0, level: 1, msg: 0 }
    const need = xpNeeded(user.level)
    reply(`⭐ *Level de @${target.split('@')[0]}*\n\n📊 Level: *${user.level}*\n✨ XP: *${user.xp}/${need}*\n💬 Mensagens: *${user.msg || 0}*`)
  }
}
