'use strict'

const { drawDado } = require('../../modules/games/imageBoard')
const { safeUnlink } = require('../../utils/helpers')

module.exports = {
  name: 'dado',
  description: '🎲 Rola um dado (imagem 1-6)',
  category: 'jogos',
  aliases: ['dice', 'rolar'],
  cooldown: 3,
  async execute({ reply, sendImage, react }) {
    await react('🎲')
    const face = Math.floor(Math.random() * 6) + 1
    const img = await drawDado(face)
    await sendImage(img, `🎲 Saiu: *${face}*`)
    safeUnlink(img)
  }
}
