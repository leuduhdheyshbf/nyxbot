const fs = require('fs')
const { drawQuote } = require('../../modules/games/imageBoard')
const { safeUnlink } = require('../../utils/helpers')

const ITEMS = ["Poção de coragem preparada.", "Feitiço de sorte lançado.", "Portal dimensional instável...", "Mana restaurada."]

module.exports = {
  name: 'magia',
  description: 'Magia',
  category: 'resenha',
  aliases: ["feitico"],
  async execute({ client, from, info, reply, reagir, q }) {
    await reagir('🪄')
    const text = ITEMS[Math.floor(Math.random() * ITEMS.length)]
    try {
      const img = await drawQuote({ title: 'Magia', emoji: '🪄', text })
      await client.sendMessage(from, {
        image: fs.readFileSync(img),
        caption: `🪄 *Magia*\n\n${text}`
      }, { quoted: info })
      safeUnlink(img)
    } catch {
      await reply(`🪄 *Magia*\n\n${text}`)
    }
  }
}
