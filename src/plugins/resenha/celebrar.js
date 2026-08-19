'use strict'

const { sendGifReaction, resolveTarget } = require('../../utils/gifUtils')

module.exports = {
  name: 'celebrar',
  description: 'Celebra com alguém com um GIF animado',
  category: 'resenha',
  aliases: ["celebra"],
  cooldown: 3,

  async execute({ client, from, info, args, reply, reagir, sender }) {
    const target = resolveTarget(info, args)
    if (!target) {
      return reply('❗ Marque ou responda alguém.\nEx: .celebrar @pessoa')
    }

    await reagir('🎉')

    const fromTag = '@' + String(sender).split('@')[0]
    const toTag = '@' + String(target).split('@')[0]
    const caption = `🎉 ${fromTag} *celebrando com* ${toTag}!`

    await sendGifReaction({
      client,
      from,
      info,
      sender,
      target,
      caption,
      actions: ["dance","happy","highfive"]
    })
  }
}
