const fs = require('fs')
const MUTE_PATH = './database/mutes.json'

function load() {
  try { if (fs.existsSync(MUTE_PATH)) return JSON.parse(fs.readFileSync(MUTE_PATH)) } catch {}
  return {}
}
function save(d) { fs.writeFileSync(MUTE_PATH, JSON.stringify(d, null, 2)) }

module.exports = {
  name: 'unmute',
  description: 'Remove silêncio de um membro',
  category: 'admin',
  aliases: ['desilenciar'],
  async execute({ from, info, reply, reagir, isGroup, isAdm, isDono, args }) {
    if (!isGroup) return reply('❌ Só em grupos.')
    if (!isAdm && !isDono) return reply('❌ Só admins.')

    const quoted = info.message?.extendedTextMessage?.contextInfo
    let target = quoted?.participant || quoted?.mentionedJid?.[0]
    if (!target && args[0]) target = args[0].replace(/\D/g, '') + '@s.whatsapp.net'
    if (!target) return reply('❗ Marque alguém.')

    const data = load()
    if (data[from]) data[from] = data[from].filter(x => x !== target)
    save(data)

    await reagir('🔊')
    reply(`🔊 @${target.split('@')[0]} pode falar de novo.`)
  }
}
