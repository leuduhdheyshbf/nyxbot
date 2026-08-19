const fs = require('fs')
const { drawShip } = require('../../modules/games/imageBoard')
const { safeUnlink } = require('../../utils/helpers')

module.exports = {
  name: 'ship',
  description: 'Shippa duas pessoas',
  category: 'resenha',
  aliases: ['shippar'],
  async execute({ client, from, info, reply, reagir, args, sender, isGroup, groupMembers }) {
    await reagir('💘')
    const quoted = info.message?.extendedTextMessage?.contextInfo
    let p1 = quoted?.mentionedJid?.[0] || (args[0] ? args[0].replace(/\D/g, '') + '@s.whatsapp.net' : null)
    let p2 = quoted?.mentionedJid?.[1] || (args[1] ? args[1].replace(/\D/g, '') + '@s.whatsapp.net' : null)

    try {
      if (!p1) {
        const members = (groupMembers || []).map(m => m.id || m).filter(Boolean)
        if (members.length < 2) return reply('❗ Marque 2 pessoas ou use em grupo.')
        p1 = members[Math.floor(Math.random() * members.length)]
        p2 = members[Math.floor(Math.random() * members.length)]
        while (p2 === p1) p2 = members[Math.floor(Math.random() * members.length)]
      }
      if (!p2) p2 = sender

      const pct = Math.floor(Math.random() * 101)
      const n1 = '@' + p1.split('@')[0]
      const n2 = '@' + p2.split('@')[0]
      const img = await drawShip({ p1: n1, p2: n2, percent: pct })
      await client.sendMessage(from, {
        image: fs.readFileSync(img),
        caption: `💘 *SHIP*\n${n1} + ${n2}\nCompatibilidade: *${pct}%*`,
        mentions: [p1, p2]
      }, { quoted: info })
      safeUnlink(img)
    } catch (e) {
      reply('❌ Erro no ship: ' + e.message)
    }
  }
}
