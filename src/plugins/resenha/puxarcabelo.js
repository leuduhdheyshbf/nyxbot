'use strict'

const { sendGifReaction, resolveTarget } = require('../../utils/gifUtils')

module.exports = {
  name: 'puxarcabelo',
  description: 'Puxa o cabelo de alguém com um GIF animado',
  category: 'resenha',
  aliases: ["puxar"],
  cooldown: 3,

  async execute({ client, from, info, args, reply, reagir, sender }) {
    const target = resolveTarget(info, args)
    if (!target) {
      return reply('❗ Marque ou responda alguém.\nEx: .puxarcabelo @pessoa')
    }

    await reagir('💇')

    const fromTag = '@' + String(sender).split('@')[0]
    const toTag = '@' + String(target).split('@')[0]
    const caption = `💇 ${fromTag} *puxou o cabelo* de ${toTag}!`

    await sendGifReaction({
      client,
      from,
      info,
      sender,
      target,
      caption,
      actions: ["bonk","slap"]
    })
  }
}
