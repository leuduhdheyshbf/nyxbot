'use strict'

const { drawMoeda } = require('../../modules/games/imageBoard')
const { safeUnlink } = require('../../utils/helpers')

module.exports = {
  name: 'moeda',
  description: '🪙 Cara ou coroa com imagem',
  category: 'jogos',
  aliases: ['caracoroa', 'coin'],
  cooldown: 3,
  async execute({ reply, sendImage, react }) {
    await react('🪙')
    const lado = Math.random() < 0.5 ? 'cara' : 'coroa'
    const img = await drawMoeda(lado)
    await sendImage(img, `🪙 Deu: *${lado.toUpperCase()}*`)
    safeUnlink(img)
  }
}
