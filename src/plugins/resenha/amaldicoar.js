'use strict'

const { sendGifReaction, resolveTarget } = require('../../utils/gifUtils')

module.exports = {
  name: 'amaldicoar',
  description: 'Amaldiçoa alguém com um GIF animado',
  category: 'resenha',
  aliases: ["maldicao"],
  cooldown: 3,

  async execute({ client, from, info, args, reply, reagir, sender }) {
    const target = resolveTarget(info, args)
    if (!target) {
      return reply('❗ Marque ou responda alguém.\nEx: .amaldicoar @pessoa')
    }

    await reagir('🔮')

    const fromTag = '@' + String(sender).split('@')[0]
    const toTag = '@' + String(target).split('@')[0]
    const caption = `🔮 ${fromTag} *amaldiçoou* ${toTag}!`

    await sendGifReaction({
      client,
      from,
      info,
      sender,
      target,
      caption,
      actions: ["cringe","bully","cry"]
    })
  }
}
