const fs = require('fs')
const { drawQuote } = require('../../modules/games/imageBoard')
const { safeUnlink } = require('../../utils/helpers')

const ITEMS = ["Sim, definitivamente! ✅", "Não, nem pensar! ❌", "Melhor não te contar... 🤫", "Com certeza! 💯", "As chances são boas! 🎯", "Talvez... 🤔", "Não conte com isso. 😬", "Sim, mas não agora. ⏳", "Claro que sim! 🎉", "Isso é um mistério... 🔮"]

module.exports = {
  name: '8ball',
  description: 'Bola 8',
  category: 'resenha',
  aliases: ["magic8", "bola8"],
  async execute({ client, from, info, reply, reagir, q }) {
    if (!q) return reply('❓ Faça uma pergunta: .8ball [pergunta]')
    await reagir('🎱')
    const text = ITEMS[Math.floor(Math.random() * ITEMS.length)]
    try {
      const img = await drawQuote({ title: 'Bola 8', emoji: '🎱', text })
      await client.sendMessage(from, {
        image: fs.readFileSync(img),
        caption: `🎱 *Bola 8*\n\n${text}`
      }, { quoted: info })
      safeUnlink(img)
    } catch {
      await reply(`🎱 *Bola 8*\n\n${text}`)
    }
  }
}
