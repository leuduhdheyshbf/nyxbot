const fs = require('fs')
const WARN_PATH = './database/warns.json'

module.exports = {
  name: 'listwarn',
  description: 'Lista advertências do grupo',
  category: 'admin',
  aliases: ['warns', 'advertencias'],
  async execute({ from, reply, reagir, isGroup, isAdm, isDono }) {
    if (!isGroup) return reply('❌ Só em grupos.')
    if (!isAdm && !isDono) return reply('❌ Só admins.')
    try {
      await reagir('📋')
      let warns = {}
      if (fs.existsSync(WARN_PATH)) warns = JSON.parse(fs.readFileSync(WARN_PATH))
      const group = warns[from] || {}
      const entries = Object.entries(group).filter(([, v]) => v > 0)
      if (!entries.length) return reply('📋 Nenhuma advertência neste grupo.')
      let text = '📋 *Advertências*\n\n'
      for (const [jid, count] of entries) {
        text += `• @${jid.split('@')[0]} → ${count}/3\n`
      }
      reply(text)
    } catch {
      reply('❌ Erro.')
    }
  }
}
