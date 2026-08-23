const fs = require('fs')
const { drawQuote } = require('../../modules/games/imageBoard')
const { safeUnlink } = require('../../utils/helpers')
const celebridades = [
  { nome: 'Elon Musk', fala: 'Vamos colonizar Marte! 🚀' },
  { nome: 'Snoop Dogg', fala: 'Fumaaaando! 🌿' },
  { nome: 'Juliette', fala: 'Ai meu Deus! 🙏' },
  { nome: 'Gustavo Lima', fala: 'Modão! 🎵' }
]
module.exports = {
  name: 'celebridade',
  description: 'Fala como uma celebridade',
  category: 'resenha',
  aliases: ['celebridades', 'famoso'],
  async execute({ client, from, info, reply, reagir }) {
    await reagir('⭐')
    const c = celebridades[Math.floor(Math.random() * celebridades.length)]
    const text = `${c.nome}: "${c.fala}"`
    try {
      const img = await drawQuote({ title: 'Celebridade', emoji: '⭐', text })
      await client.sendMessage(from, { image: fs.readFileSync(img), caption: `⭐ ${text}` }, { quoted: info })
      safeUnlink(img)
    } catch { await reply(`⭐ ${text}`) }
  }
}
