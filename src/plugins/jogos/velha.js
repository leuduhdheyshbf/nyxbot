'use strict'

const { drawVelha } = require('../../modules/games/imageBoard')
const { safeUnlink } = require('../../utils/helpers')

const jogos = new Map()
const TTL = 10 * 60 * 1000

function limparExpirados() {
  const now = Date.now()
  for (const [k, v] of jogos) {
    if (now - v.updated > TTL) jogos.delete(k)
  }
}

function verificar(board, simbolo) {
  const wins = [
    [0, 1, 2], [3, 4, 5], [6, 7, 8],
    [0, 3, 6], [1, 4, 7], [2, 5, 8],
    [0, 4, 8], [2, 4, 6]
  ]
  return wins.some((line) => line.every((i) => board[i] === simbolo))
}

module.exports = {
  name: 'velha',
  description: '🎮 Jogo da velha com imagem do tabuleiro',
  category: 'jogos',
  aliases: ['jogovelha', 'ttt', 'jogodavelha'],
  cooldown: 2,
  async execute(ctx) {
    limparExpirados()
    const { from, sender, args, reply, sendImage, prefix } = ctx
    const key = from
    const cmd = (args[0] || '').toLowerCase()

    if (cmd === 'sair') {
      jogos.delete(key)
      return reply('🚪 Jogo da velha encerrado.')
    }

    if (!jogos.has(key) || cmd === 'novo') {
      jogos.set(key, {
        board: Array(9).fill(null),
        player: sender,
        turno: 'player',
        updated: Date.now()
      })
      const img = await drawVelha(Array(9).fill(null))
      await sendImage(img, `🎮 *JOGO DA VELHA*\n\nResponda com: *${prefix}velha [1-9]*\nSair: *${prefix}velha sair*`)
      safeUnlink(img)
      return
    }

    const jogo = jogos.get(key)
    if (jogo.player !== sender) {
      return reply('⚠️ Este jogo é de outro jogador. Use `' + prefix + 'velha novo` para começar o seu.')
    }

    const pos = parseInt(args[0], 10) - 1
    if (isNaN(pos) || pos < 0 || pos > 8) {
      return reply(`❗ Use: *${prefix}velha [1-9]*`)
    }
    if (jogo.board[pos]) return reply('❌ Posição ocupada!')

    jogo.board[pos] = 'X'
    jogo.updated = Date.now()

    if (verificar(jogo.board, 'X')) {
      const img = await drawVelha(jogo.board)
      await sendImage(img, '🎉 *VOCÊ GANHOU!*')
      safeUnlink(img)
      jogos.delete(key)
      return
    }
    if (jogo.board.every(Boolean)) {
      const img = await drawVelha(jogo.board)
      await sendImage(img, '😐 *EMPATE!*')
      safeUnlink(img)
      jogos.delete(key)
      return
    }

    // bot joga
    const vazias = jogo.board.map((v, i) => (v ? null : i)).filter((v) => v !== null)
    const botMove = vazias[Math.floor(Math.random() * vazias.length)]
    jogo.board[botMove] = 'O'

    if (verificar(jogo.board, 'O')) {
      const img = await drawVelha(jogo.board)
      await sendImage(img, '💀 *BOT GANHOU!*')
      safeUnlink(img)
      jogos.delete(key)
      return
    }
    if (jogo.board.every(Boolean)) {
      const img = await drawVelha(jogo.board)
      await sendImage(img, '😐 *EMPATE!*')
      safeUnlink(img)
      jogos.delete(key)
      return
    }

    const img = await drawVelha(jogo.board)
    await sendImage(img, `Sua vez! *${prefix}velha [1-9]*`)
    safeUnlink(img)
  }
}
