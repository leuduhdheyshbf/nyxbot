'use strict'

const { sendGifReaction, resolveTarget } = require('../../utils/gifUtils')

module.exports = {
  name: 'surpreender',
  description: 'Surpreende alguém com um GIF animado',
  category: 'resenha',
  aliases: ["surpresa"],
  cooldown: 3,

  async execute({ client, from, info, args, reply, reagir, sender }) {
    const target = resolveTarget(info, args)
    if (!target) {
      return reply('❗ Marque ou responda alguém.\nEx: .surpreender @pessoa')
    }

    await reagir('😲')

    const fromTag = '@' + String(sender).split('@')[0]
    const toTag = '@' + String(target).split('@')[0]
    const caption = `😲 ${fromTag} *surpreendeu* ${toTag}!`

    await sendGifReaction({
      client,
      from,
      info,
      sender,
      target,
      caption,
      actions: ["happy","wink","dance"]
    })
  }
}
