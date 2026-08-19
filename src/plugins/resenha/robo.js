const fs = require('fs')
const { drawQuote } = require('../../modules/games/imageBoard')
const { safeUnlink } = require('../../utils/helpers')
module.exports = {
  name: 'robo',
  description: 'Fala como Robô',
  category: 'resenha',
  aliases: ["robot"],
  async execute({ client, from, info, reply, reagir, args, q }) {
    const texto = q || args.join(' ') || 'Olá'
    await reagir('🤖')
    const text = 'BEEP. {t}. PROCESSADO.'.replace('{t}', texto)
    try {
      const img = await drawQuote({ title: 'Robô', emoji: '🤖', text })
      await client.sendMessage(from, { image: fs.readFileSync(img), caption: `🤖 ${text}` }, { quoted: info })
      safeUnlink(img)
    } catch { await reply(`🤖 ${text}`) }
  }
}
