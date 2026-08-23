const fs = require('fs')
const { drawMeter } = require('../../modules/games/imageBoard')
const { safeUnlink } = require('../../utils/helpers')

module.exports = {
  name: 'gay',
  description: 'Medidor gay (brincadeira)',
  category: 'resenha',
  aliases: ['gaymetro'],
  async execute({ client, from, info, reply, reagir, args, sender }) {
    await reagir('🏳️‍🌈')
    const quoted = info.message?.extendedTextMessage?.contextInfo
    let target = quoted?.participant || quoted?.mentionedJid?.[0] || sender
    if (args[0] && !quoted) {
      const n = args[0].replace(/\D/g, '')
      if (n.length >= 10) target = n + '@s.whatsapp.net'
    }
    const pct = Math.floor(Math.random() * 101)
    const name = '@' + String(target).split('@')[0]
    try {
      const img = await drawMeter({ title: 'Gaymetro', emoji: '🏳️‍🌈', name, percent: pct })
      await client.sendMessage(from, {
        image: fs.readFileSync(img),
        caption: `🏳️‍🌈 ${name} é *${pct}%* gay`,
        mentions: [target]
      }, { quoted: info })
      safeUnlink(img)
    } catch (e) {
      await client.sendMessage(from, {
        text: `🏳️‍🌈 ${name} é *${pct}%* gay`,
        mentions: [target]
      }, { quoted: info })
    }
  }
}
