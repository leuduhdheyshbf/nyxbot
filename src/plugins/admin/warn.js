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
  name: 'warn',
  description: 'Dá advertência a um membro (3 = ban)',
  category: 'admin',
  aliases: ['advertir', 'aviso'],
  async execute({ nyx, from, info, reply, reagir, isGroup, isAdm, isDono, isBotAdm, args, groupMembers }) {
    if (!isGroup) return reply('❌ Só em grupos.')
    if (!isAdm && !isDono) return reply('❌ Só administradores.')

    const quoted = info.message?.extendedTextMessage?.contextInfo
    let target = quoted?.participant || quoted?.mentionedJid?.[0]
    if (!target && args[0]) target = args[0].replace(/\D/g, '') + '@s.whatsapp.net'
    if (!target) return reply('❗ Marque alguém ou use: .warn @pessoa')

    const warns = loadWarns()
    if (!warns[from]) warns[from] = {}
    warns[from][target] = (warns[from][target] || 0) + 1
    const count = warns[from][target]
    saveWarns(warns)

    await reagir('⚠️')
    await nyx.sendMessage(from, {
      text: `⚠️ *Advertência ${count}/3*\n👤 @${target.split('@')[0]}\n\n${count >= 3 ? '🚫 Limite atingido! Removendo...' : 'Mais uma e será removido.'}`,
      mentions: [target]
    }, { quoted: info })

    if (count >= 3 && isBotAdm) {
      try {
        await nyx.groupParticipantsUpdate(from, [target], 'remove')
        warns[from][target] = 0
        saveWarns(warns)
        reply('🚫 Membro removido por excesso de advertências.')
      } catch {
        reply('❌ Não consegui remover (preciso ser admin).')
      }
    }
  }
}
