'use strict'

const { divorce, isMarried } = require('../../utils/marriage')
const { getGifUrlWithFallback } = require('../../utils/gifUtils')

module.exports = {
  name: 'divorciar',
  description: 'Se divorcia do cônjuge 💔',
  category: 'resenha',
  aliases: ['divorcio', 'divorce'],
  cooldown: 5,

  async execute({ client, from, info, reply, reagir, sender }) {
    if (!isMarried(sender)) {
      return reply('❗ Você não está casado(a).')
    }

    await reagir('📄')

    const result = divorce(sender)
    if (!result.ok) return reply('❌ ' + result.reason)

    const a = '@' + String(sender).split('@')[0]
    const b = '@' + String(result.ex).split('@')[0]
    const caption =
      `📄 *DIVÓRCIO*\n\n` +
      `${a} e ${b} se divorciaram.\n` +
      `_Cada um segue seu caminho..._ 💔`

    try {
      const gifUrl = await getGifUrlWithFallback(['cry', 'wave'])
      if (gifUrl) {
        await client.sendMessage(
          from,
          {
            video: { url: gifUrl },
            gifPlayback: true,
            caption,
            mentions: [sender, result.ex]
          },
          { quoted: info }
        )
        return
      }
    } catch (e) {
      console.error('[divorciar]', e.message)
    }

    await client.sendMessage(
      from,
      { text: caption, mentions: [sender, result.ex] },
      { quoted: info }
    )
  }
}
