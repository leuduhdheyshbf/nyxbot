module.exports = {
  name: 'batalha',
  description: 'Batalha naval',
  category: 'resenha',
  aliases: ['naval', 'battleship'],
  async execute({ reply }) {
    const tabuleiro = Array(5).fill().map(() => Array(5).fill('🌊'))
    const navios = ['🚢', '🚢', '🚢']

    for (const navio of navios) {
      let x, y
      do {
        x = Math.floor(Math.random() * 5)
        y = Math.floor(Math.random() * 5)
      } while (tabuleiro[x][y] !== '🌊')
      tabuleiro[x][y] = navio
    }

    let texto = '⚓ *BATALHA NAVAL*\n\n'
    for (const linha of tabuleiro) {
      texto += linha.join(' ') + '\n'
    }
    texto += '\nEncontre os 3 navios! Boa sorte! 🌊'

    reply(texto)
  }
}
