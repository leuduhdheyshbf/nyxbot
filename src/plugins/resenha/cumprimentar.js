'use strict'

const { sendGifReaction, resolveTarget } = require('../../utils/gifUtils')

module.exports = {
  name: 'cumprimentar',
  description: 'Cumprimenta alguém com um GIF animado',
  category: 'resenha',
  aliases: ["ola","oi"],
  cooldown: 3,

  async execute({ client, from, info, args, reply, reagir, sender }) {
    const target = resolveTarget(info, args)
    if (!target) {
      return reply('❗ Marque ou responda alguém.\nEx: .cumprimentar @pessoa')
    }

    await reagir('👋')

    const fromTag = '@' + String(sender).split('@')[0]
    const toTag = '@' + String(target).split('@')[0]
    const caption = `👋 ${fromTag} *cumprimentou* ${toTag}!`

    await sendGifReaction({
      client,
      from,
      info,
      sender,
      target,
      caption,
      actions: ["wave","highfive"]
    })
  }
}
