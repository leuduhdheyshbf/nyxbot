module.exports = {
  name: 'blackjack',
  description: 'Jogo de 21 (Blackjack)',
  category: 'resenha',
  aliases: ['bj', 'vinteum'],
  async execute({ reply }) {
    const cartas = ['A', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K']
    const naipes = ['♠', '♥', '♦', '♣']

    const valor = (carta) => {
      if (carta === 'A') return 11
      if (['J', 'Q', 'K'].includes(carta)) return 10
      return parseInt(carta)
    }

    const jogador = []
    const dealer = []

    for (let i = 0; i < 2; i++) {
      jogador.push({ carta: cartas[Math.floor(Math.random() * cartas.length)], naipe: naipes[Math.floor(Math.random() * naipes.length)] })
      dealer.push({ carta: cartas[Math.floor(Math.random() * cartas.length)], naipe: naipes[Math.floor(Math.random() * naipes.length)] })
    }

    const totalJogador = jogador.reduce((acc, c) => acc + valor(c.carta), 0)
    const totalDealer = dealer.reduce((acc, c) => acc + valor(c.carta), 0)

    let texto = '🃏 *BLACKJACK - 21*\n\n'
    texto += '👤 *Jogador:* '
    texto += jogador.map(c => `${c.carta}${c.naipe}`).join(' ')
    texto += ` (${totalJogador})\n\n`
    texto += '🤖 *Dealer:* '
    texto += dealer.map(c => `${c.carta}${c.naipe}`).join(' ')
    texto += ` (${totalDealer})\n\n`

    if (totalJogador === 21) {
      texto += '🎉 *BLACKJACK! Você ganhou!*'
    } else if (totalJogador > 21) {
      texto += '💀 *Estourou! Você perdeu!*'
    } else if (totalDealer > 21) {
      texto += '🎉 *Dealer estourou! Você ganhou!*'
    } else if (totalJogador > totalDealer) {
      texto += '🎉 *Você ganhou!*'
    } else if (totalJogador < totalDealer) {
      texto += '😔 *Você perdeu!*'
    } else {
      texto += '🤝 *Empate!*'
    }

    reply(texto)
  }
}
