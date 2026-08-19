const fs = require('fs')
const PATH = './database/xp.json'
function load(){try{if(fs.existsSync(PATH))return JSON.parse(fs.readFileSync(PATH))}catch{}return{}}

module.exports = {
  name: 'rank',
  description: 'Ranking de XP do grupo',
  category: 'utilidades',
  aliases: ['ranking', 'top'],
  async execute({ nyx, from, reply, reagir, isGroup, groupMembers }) {
    if (!isGroup) return reply('❌ Só em grupos.')
    await reagir('🏆')
    const data = load()
    const members = (groupMembers||[]).map(m=>m.id||m)
    const list = members
      .map(id => ({ id, ...(data[id]||{xp:0,level:1,msg:0}) }))
      .sort((a,b)=> (b.level-a.level) || (b.xp-a.xp))
      .slice(0,10)

    if (!list.length) return reply('🏆 Ainda sem ranking.')
    let text = '🏆 *TOP 10 DO GRUPO*\n\n'
    list.forEach((u,i)=>{
      text += `${i+1}. @${u.id.split('@')[0]} — Lv.${u.level} (${u.xp} XP)\n`
    })
    await nyx.sendMessage(from, { text, mentions: list.map(u=>u.id) })
  }
}
