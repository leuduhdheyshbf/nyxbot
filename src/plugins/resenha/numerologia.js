const fs = require('fs')
const { drawQuote } = require('../../modules/games/imageBoard')
const { safeUnlink } = require('../../utils/helpers')

const ITEMS = ["Seu número do dia: 7 — intuição.", "Número 3 — criatividade.", "Número 9 — recomeços.", "Número 1 — liderança."]

module.exports = {
  name: 'numerologia',
  description: 'Numerologia',
  category: 'resenha',
  aliases: [],
  async execute({ client, from, info, reply, reagir, q }) {
    await reagir('🔢')
    const text = ITEMS[Math.floor(Math.random() * ITEMS.length)]
    try {
      const img = await drawQuote({ title: 'Numerologia', emoji: '🔢', text })
      await client.sendMessage(from, {
        image: fs.readFileSync(img),
        caption: `🔢 *Numerologia*\n\n${text}`
      }, { quoted: info })
      safeUnlink(img)
    } catch {
      await reply(`🔢 *Numerologia*\n\n${text}`)
    }
  }
}
