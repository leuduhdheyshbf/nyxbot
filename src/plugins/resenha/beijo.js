'use strict'

const { fetchReactionImages, sendReactionImages } = require('../../utils/reactions')

module.exports = {
  name: 'beijo',
  description: 'beijou alguém (com imagem)',
  category: 'resenha',
  aliases: ["kiss", "beijar"],
  cooldown: 3,

  async execute({ client, from, info, reply, reagir, sender, pushname }) {
    const quoted = info.message?.extendedTextMessage?.contextInfo
    const target = quoted?.participant || quoted?.mentionedJid?.[0]
    if (!target) return reply('❗ Marque ou responda alguém.\nEx: .beijo @pessoa')

    await reagir('💋')

    const fromTag = '@' + String(sender).split('@')[0]
    const toTag = '@' + String(target).split('@')[0]
    const caption = `💋 ${fromTag} *beijou* ${toTag}!`

    try {
      const urls = await fetchReactionImages('kiss', 2)
      if (!urls.length) throw new Error('API sem imagem')
      await sendReactionImages(client, from, info, urls, caption, [sender, target])
    } catch (e) {
      console.error('[beijo]', e.message)
      // fallback texto se API cair
      await client.sendMessage(
        from,
        { text: caption, mentions: [sender, target] },
        { quoted: info }
      )
    }
  }
}
