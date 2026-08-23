const fs = require('fs')
const PATH = './database/xp.json'
function load(){try{if(fs.existsSync(PATH))return JSON.parse(fs.readFileSync(PATH))}catch{}return{}}
function save(d){fs.writeFileSync(PATH,JSON.stringify(d,null,2))}

module.exports = {
  name: 'daily',
  description: 'Recompensa diária de XP',
  category: 'utilidades',
  aliases: ['diario'],
  async execute({ reply, reagir, sender }) {
    const data = load()
    if (!data[sender]) data[sender] = { xp:0, level:1, msg:0, daily:0 }
    const now = Date.now()
    const last = data[sender].daily || 0
    if (now - last < 24*60*60*1000) {
      const h = Math.ceil((24*60*60*1000 - (now-last))/3600000)
      return reply(`⏳ Já pegou o daily.\nVolte em ~${h}h.`)
    }
    const gain = Math.floor(Math.random()*50)+30
    data[sender].xp += gain
    data[sender].daily = now
    // level up
    while (data[sender].xp >= data[sender].level * 100) {
      data[sender].xp -= data[sender].level * 100
      data[sender].level++
    }
    save(data)
    await reagir('🎁')
    reply(`🎁 *Daily coletado!*\n+${gain} XP\nLevel atual: *${data[sender].level}*`)
  }
}
