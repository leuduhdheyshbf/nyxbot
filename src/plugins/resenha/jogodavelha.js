const jogos = new Map()

module.exports = {
  name: 'jogodavelha',
  description: 'Jogo da velha',
  category: 'resenha',
  aliases: ['velha', 'jv', 'ttt'],
  async execute({ reply, from, sender, args }) {
    const key = from
    const cmd = (args[0] || '').toLowerCase()

    if (cmd === 'sair') {
      jogos.delete(key)
      return reply('🚪 Jogo encerrado.')
    }

    if (!jogos.has(key) || cmd === 'novo') {
      jogos.set(key, {
        board: ['⬜','⬜','⬜','⬜','⬜','⬜','⬜','⬜','⬜'],
        jogador: '❌',
        bot: '⭕',
        turno: 'player',
        player: sender
      })
      return reply(`🎮 *JOGO DA VELHA*\n\n⬜⬜⬜\n⬜⬜⬜\n⬜⬜⬜\n\nSua vez! Use: !jogodavelha [1-9]`)
    }

    const jogo = jogos.get(key)
    const pos = parseInt(args[0]) - 1

    if (jogo.turno !== 'player') return reply('⏳ Aguarde o bot jogar!')
    if (isNaN(pos) || pos < 0 || pos > 8) return reply('❗ Use: !jogodavelha [1-9]')
    if (jogo.board[pos] !== '⬜') return reply('❌ Essa posição já está ocupada!')

    jogo.board[pos] = jogo.jogador
    jogo.turno = 'bot'

    const mostrar = () => {
      return `🎮 *JOGO DA VELHA*\n\n${jogo.board[0]}${jogo.board[1]}${jogo.board[2]}\n${jogo.board[3]}${jogo.board[4]}${jogo.board[5]}\n${jogo.board[6]}${jogo.board[7]}${jogo.board[8]}`
    }

    const verificar = (simbolo) => {
      const v = [
        [0,1,2],[3,4,5],[6,7,8],
        [0,3,6],[1,4,7],[2,5,8],
        [0,4,8],[2,4,6]
      ]
      return v.some(pos => pos.every(i => jogo.board[i] === simbolo))
    }

    if (verificar(jogo.jogador)) {
      jogos.delete(key)
      return reply(`${mostrar()}\n\n🎉 *VOCÊ GANHOU!* 🎉`)
    }

    if (!jogo.board.includes('⬜')) {
      jogos.delete(key)
      return reply(`${mostrar()}\n\n😐 *EMPATE!*`)
    }

    const empty = jogo.board.map((v,i) => v === '⬜' ? i : null).filter(v => v !== null)
    const botMove = empty[Math.floor(Math.random() * empty.length)]
    jogo.board[botMove] = jogo.bot
    jogo.turno = 'player'

    if (verificar(jogo.bot)) {
      jogos.delete(key)
      return reply(`${mostrar()}\n\n💀 *BOT GANHOU!*`)
    }

    if (!jogo.board.includes('⬜')) {
      jogos.delete(key)
      return reply(`${mostrar()}\n\n😐 *EMPATE!*`)
    }

    reply(`${mostrar()}\n\nSua vez! Use: !jogodavelha [1-9]`)
  }
}
