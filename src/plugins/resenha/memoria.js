const jogos = new Map()

module.exports = {
  name: 'memoria',
  description: 'Jogo de memória',
  category: 'resenha',
  aliases: ['memory'],
  async execute({ reply, from, sender, args }) {
    const key = from
    const cmd = (args[0] || '').toLowerCase()

    if (cmd === 'sair') {
      jogos.delete(key)
      return reply('🚪 Jogo encerrado.')
    }

    if (!jogos.has(key) || cmd === 'novo') {
      const numeros = Array.from({ length: 6 }, (_, i) => i + 1)
      const embaralhado = [...numeros, ...numeros].sort(() => Math.random() - 0.5)
      jogos.set(key, {
        numeros: embaralhado,
        revelados: Array(12).fill(false),
        pares: 0,
        tentativas: 0,
        player: sender,
        esperando: false
      })
      return reply(`🧠 *JOGO DA MEMÓRIA*\n\nTente encontrar os pares!\nUse: !memoria [1-12]\n\n${Array(12).fill('🟦').join(' ')}`)
    }

    const jogo = jogos.get(key)
    if (jogo.esperando) return reply('⏳ Aguarde...')

    const pos = parseInt(args[0]) - 1
    if (isNaN(pos) || pos < 0 || pos > 11) return reply('❗ Use: !memoria [1-12]')
    if (jogo.revelados[pos]) return reply('❌ Essa carta já está virada!')

    jogo.revelados[pos] = true
    jogo.tentativas++

    const mostrar = () => {
      return jogo.numeros.map((n, i) => jogo.revelados[i] ? n : '🟦').join(' ')
    }

    const revelados = jogo.revelados.map((v, i) => v ? i : -1).filter(v => v >= 0)
    if (revelados.length === 2) {
      const [a, b] = revelados
      if (jogo.numeros[a] === jogo.numeros[b]) {
        jogo.pares++
        if (jogo.pares === 6) {
          jogos.delete(key)
          return reply(`🎉 *VOCÊ GANHOU!*\n\nTentativas: ${jogo.tentativas}\n\nParabéns! 🏆`)
        }
        return reply(`✅ Par encontrado!\n\n${mostrar()}\n\nPares: ${jogo.pares}/6\nTentativas: ${jogo.tentativas}`)
      } else {
        jogo.esperando = true
        setTimeout(() => {
          jogo.revelados[a] = false
          jogo.revelados[b] = false
          jogo.esperando = false
        }, 2000)
        return reply(`❌ Não é par!\n\n${mostrar()}\n\nTentativas: ${jogo.tentativas}`)
      }
    }

    reply(`${mostrar()}\n\nPares: ${jogo.pares}/6\nTentativas: ${jogo.tentativas}`)
  }
}
