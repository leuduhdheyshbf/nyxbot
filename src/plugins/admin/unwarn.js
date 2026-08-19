const fs = require('fs')
const WARN_PATH = './database/warns.json'

function loadWarns() {
  try {
    if (fs.existsSync(WARN_PATH)) return JSON.parse(fs.readFileSync(WARN_PATH))
  } catch {}
  return {}
}
function saveWarns(data) {
  fs.writeFileSync(WARN_PATH, JSON.stringify(data, null, 2))
}

module.exports = {
  name: 'unwarn',
  description: 'Remove advertência de um membro',
  category: 'admin',
  aliases: ['desadvertir'],
  async execute({ from, info, reply, reagir, isGroup, isAdm, isDono, args }) {
    if (!isGroup) return reply('❌ Só em grupos.')
    if (!isAdm && !isDono) return reply('❌ Só administradores.')

    const quoted = info.message?.extendedTextMessage?.contextInfo
    let target = quoted?.participant || quoted?.mentionedJid?.[0]
    if (!target && args[0]) target = args[0].replace(/\D/g, '') + '@s.whatsapp.net'
    if (!target) return reply('❗ Marque alguém.')

    const warns = loadWarns()
    if (!warns[from]) warns[from] = {}
    warns[from][target] = Math.max(0, (warns[from][target] || 0) - 1)
    saveWarns(warns)

    await reagir('✅')
    reply(`✅ Advertência removida de @${target.split('@')[0]}\nAgora: ${warns[from][target]}/3`)
  }
}
