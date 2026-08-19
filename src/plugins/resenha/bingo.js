module.exports = {
  name: 'bingo',
  description: 'Bingo',
  category: 'resenha',
  aliases: [],
  async execute({ reply }) {
    const cartela = Array.from({ length: 5 }, () =>
      Array.from({ length: 5 }, () => Math.floor(Math.random() * 75) + 1)
    )

    let texto = '🎱 *BINGO*\n\n'
    texto += 'B  I  N  G  O\n'
    texto += '─────────────\n'

    for (const linha of cartela) {
      texto += linha.map(n => String(n).padStart(2, ' ')).join(' ')
      texto += '\n'
    }

    texto += '\nBoa sorte! 🍀'

    reply(texto)
  }
}
