'use strict'

const { propose, isMarried } = require('../../utils/marriage')
const { resolveTarget } = require('../../utils/gifUtils')
const { getGifUrlWithFallback } = require('../../utils/gifUtils')

module.exports = {
  name: 'casar',
  description: 'Pede alguém em casamento 💍',
  category: 'resenha',
  aliases: ['pedircasamento', 'marry'],
  cooldown: 5,

  async execute({ client, from, info, args, reply, reagir, sender }) {
    const target = resolveTarget(info, args)
    if (!target) {
      return reply('❗ Marque ou responda a pessoa que você quer pedir em casamento.\nEx: .casar @pessoa')
    }

    if (target === sender) {
      return reply('😅 Você não pode casar consigo mesmo!')
    }

    await reagir('💍')

    const result = propose(sender, target)
    if (!result.ok) return reply('❌ ' + result.reason)

    const fromTag = '@' + String(sender).split('@')[0]
    const toTag = '@' + String(target).split('@')[0]
    const caption =
      `💍 *PEDIDO DE CASAMENTO*\n\n` +
      `${fromTag} está pedindo ${toTag} em casamento!\n\n` +
      `👉 ${toTag}, digite:\n` +
      `• *.aceitar* — para aceitar\n` +
      `• *.recusar* — para recusar\n\n` +
      `_O pedido expira em 5 minutos._`

    try {
      const gifUrl = await getGifUrlWithFallback(['blush', 'kiss', 'happy'])
      if (gifUrl) {
        await client.sendMessage(
          from,
          {
            video: { url: gifUrl },
            gifPlayback: true,
            caption,
            mentions: [sender, target]
          },
          { quoted: info }
        )
        return
      }
    } catch (e) {
      console.error('[casar]', e.message)
    }

    await client.sendMessage(
      from,
      { text: caption, mentions: [sender, target] },
      { quoted: info }
    )
  }
}
