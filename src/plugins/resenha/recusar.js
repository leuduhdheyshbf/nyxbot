'use strict'

const { reject, getPending } = require('../../utils/marriage')
const { getGifUrlWithFallback } = require('../../utils/gifUtils')

module.exports = {
  name: 'recusar',
  description: 'Recusa um pedido de casamento 💔',
  category: 'resenha',
  aliases: ['recusacasamento', 'naocasar'],
  cooldown: 3,

  async execute({ client, from, info, reply, reagir, sender }) {
    await reagir('💔')

    const pending = getPending(sender)
    if (!pending) {
      return reply('❗ Você não tem nenhum pedido de casamento pendente.')
    }

    const result = reject(sender)
    if (!result.ok) return reply('❌ ' + result.reason)

    const fromTag = '@' + String(result.from).split('@')[0]
    const toTag = '@' + String(sender).split('@')[0]
    const caption =
      `💔 *PEDIDO RECUSADO*\n\n` +
      `${toTag} recusou o pedido de casamento de ${fromTag}.\n` +
      `_Melhor sorte na próxima..._`

    try {
      const gifUrl = await getGifUrlWithFallback(['cry', 'cringe'])
      if (gifUrl) {
        await client.sendMessage(
          from,
          {
            video: { url: gifUrl },
            gifPlayback: true,
            caption,
            mentions: [result.from, sender]
          },
          { quoted: info }
        )
        return
      }
    } catch (e) {
      console.error('[recusar]', e.message)
    }

    await client.sendMessage(
      from,
      { text: caption, mentions: [result.from, sender] },
      { quoted: info }
    )
  }
}
