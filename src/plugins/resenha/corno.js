const fs = require('fs')
const { drawMeter } = require('../../modules/games/imageBoard')
const { safeUnlink } = require('../../utils/helpers')

module.exports = {
  name: 'corno',
  description: 'Medidor Corno (zoação)',
  category: 'resenha',
  aliases: [],
  async execute({ client, from, info, reply, reagir, args, sender, q }) {
    await reagir('🐮')
    const quoted = info.message?.extendedTextMessage?.contextInfo
    let target = quoted?.participant || quoted?.mentionedJid?.[0]
    let name
    if (target) name = '@' + target.split('@')[0]
    else if (q) { name = q; target = null }
    else { target = sender; name = '@' + sender.split('@')[0] }
    const pct = Math.floor(Math.random() * 101)
    try {
      const img = await drawMeter({ title: 'Medidor Corno', emoji: '🐮', name, percent: pct })
      const payload = {
        image: fs.readFileSync(img),
        caption: `🐮 *Medidor Corno*\n${name}: *${pct}%*`
      }
      if (target) payload.mentions = [target]
      await client.sendMessage(from, payload, { quoted: info })
      safeUnlink(img)
    } catch {
      await reply(`🐮 *Medidor Corno*\n${name}: *${pct}%*`)
    }
  }
}
