'use strict'

const { accept, getPending } = require('../../utils/marriage')
const { getGifUrlWithFallback } = require('../../utils/gifUtils')

module.exports = {
  name: 'aceitar',
  description: 'Aceita um pedido de casamento 💒',
  category: 'resenha',
  aliases: ['aceitacasamento', 'simcasar'],
  cooldown: 3,

  async execute({ client, from, info, reply, reagir, sender }) {
    await reagir('💒')

    const pending = getPending(sender)
    if (!pending) {
      return reply('❗ Você não tem nenhum pedido de casamento pendente.')
    }

    const result = accept(sender)
    if (!result.ok) return reply('❌ ' + result.reason)

    const partner = result.partner
    const a = '@' + String(partner).split('@')[0]
    const b = '@' + String(sender).split('@')[0]
    const caption =
      `💒 *CASAMENTO REALIZADO!*\n\n` +
      `🎉 Parabéns ${a} e ${b}!\n` +
      `Vocês agora estão oficialmente *casados* 💍❤️\n\n` +
      `_Use .casamento para ver o status._`

    try {
      const gifUrl = await getGifUrlWithFallback(['kiss', 'hug', 'happy'])
      if (gifUrl) {
        await client.sendMessage(
          from,
          {
            video: { url: gifUrl },
            gifPlayback: true,
            caption,
            mentions: [partner, sender]
          },
          { quoted: info }
        )
        return
      }
    } catch (e) {
      console.error('[aceitar]', e.message)
    }

    await client.sendMessage(
      from,
      { text: caption, mentions: [partner, sender] },
      { quoted: info }
    )
  }
}
