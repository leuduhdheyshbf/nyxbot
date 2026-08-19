const fs = require('fs')
const { drawQuote } = require('../../modules/games/imageBoard')
const { safeUnlink } = require('../../utils/helpers')

const ITEMS = ["Por que o livro de matemática está triste? Porque tem muitos problemas.", "O que o zero disse para o oito? Belo cinto!", "Por que a galinha atravessou a rua? Para provar que não era um frango.", "Qual o contrário de volátil? Vem cá sobrinho.", "Sabe qual o nome do peixe que caiu do 15º andar? Aaaaah-tum."]

module.exports = {
  name: 'piada',
  description: 'Piada',
  category: 'resenha',
  aliases: ["joke"],
  async execute({ client, from, info, reply, reagir, q }) {
    await reagir('😂')
    const text = ITEMS[Math.floor(Math.random() * ITEMS.length)]
    try {
      const img = await drawQuote({ title: 'Piada', emoji: '😂', text })
      await client.sendMessage(from, {
        image: fs.readFileSync(img),
        caption: `😂 *Piada*\n\n${text}`
      }, { quoted: info })
      safeUnlink(img)
    } catch {
      await reply(`😂 *Piada*\n\n${text}`)
    }
  }
}
