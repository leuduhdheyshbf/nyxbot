'use strict'

const { sendGifReaction, resolveTarget } = require('../../utils/gifUtils')

module.exports = {
  name: 'criticar',
  description: 'Critica alguém com um GIF animado',
  category: 'resenha',
  aliases: [],
  cooldown: 3,

  async execute({ client, from, info, args, reply, reagir, sender }) {
    const target = resolveTarget(info, args)
    if (!target) {
      return reply('❗ Marque ou responda alguém.\nEx: .criticar @pessoa')
    }

    await reagir('🗣️')

    const fromTag = '@' + String(sender).split('@')[0]
    const toTag = '@' + String(target).split('@')[0]
    const caption = `🗣️ ${fromTag} *criticou* ${toTag}!`

    await sendGifReaction({
      client,
      from,
      info,
      sender,
      target,
      caption,
      actions: ["cringe","smug"]
    })
  }
}
