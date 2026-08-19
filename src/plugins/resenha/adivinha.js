const jogos = new Map()

module.exports = {
  name: 'adivinha',
  description: 'Adivinhe o número',
  category: 'resenha',
  aliases: ['adv', 'adivinhar'],
  async execute({ reply, from, sender, args }) {
    const key = from
    const cmd = (args[0] || '').toLowerCase()

    if (cmd === 'sair') {
      jogos.delete(key)
      return reply('🚪 Jogo encerrado.')
    }

    if (!jogos.has(key) || cmd === 'novo') {
      const numero = Math.floor(Math.random() * 100) + 1
      jogos.set(key, { numero, tentativas: 7, player: sender })
      return reply(`🎯 *ADIVINHE O NÚMERO*\n\nTente adivinhar o número de 1 a 100!\nVocê tem 7 tentativas.\n\nUse: !adivinha [número]`)
    }

    const jogo = jogos.get(key)
    const chute = parseInt(args[0])
    if (!chute || chute < 1 || chute > 100) {
      return reply('❗ Use: !adivinha [número entre 1-100]')
    }

    jogo.tentativas--

    if (chute === jogo.numero) {
      jogos.delete(key)
      return reply(`🎉 *ACERTOU!*\n\nO número era *${jogo.numero}*!\nParabéns! 🏆`)
    }

    let dica = chute < jogo.numero ? '🔼 MAIS alto' : '🔽 MAIS baixo'

    if (jogo.tentativas <= 0) {
      jogos.delete(key)
      return reply(`💀 Você perdeu!\n\nO número era *${jogo.numero}*`)
    }

    reply(`❌ ${dica}\n\nRestam ${jogo.tentativas} tentativas.`)
  }
}
