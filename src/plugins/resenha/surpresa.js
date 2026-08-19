const fs = require('fs')
const { drawQuote } = require('../../modules/games/imageBoard')
const { safeUnlink } = require('../../utils/helpers')

const ITEMS = ["🎉 Parabéns, você ganhou... nada.", "✨ Uma estrela cadente passou por você.", "🍀 Sorte +3 por 5 minutos.", "💀 O caos sorriu pra você."]

module.exports = {
  name: 'surpresa',
  description: 'Surpresa',
  category: 'resenha',
  aliases: [],
  async execute({ client, from, info, reply, reagir, q }) {
    await reagir('🎁')
    const text = ITEMS[Math.floor(Math.random() * ITEMS.length)]
    try {
      const img = await drawQuote({ title: 'Surpresa', emoji: '🎁', text })
      await client.sendMessage(from, {
        image: fs.readFileSync(img),
        caption: `🎁 *Surpresa*\n\n${text}`
      }, { quoted: info })
      safeUnlink(img)
    } catch {
      await reply(`🎁 *Surpresa*\n\n${text}`)
    }
  }
}
