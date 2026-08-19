const perguntas = [
  { pergunta: 'Qual a capital do Brasil?', resposta: 'Brasília' },
  { pergunta: 'Quanto é 2+2?', resposta: '4' },
  { pergunta: 'Qual a cor do céu?', resposta: 'Azul' },
  { pergunta: 'Quanto é 10x10?', resposta: '100' },
  { pergunta: 'Qual o maior planeta do sistema solar?', resposta: 'Júpiter' },
  { pergunta: 'Qual o animal mais rápido do mundo?', resposta: 'Guepardo' },
  { pergunta: 'Quem pintou a Mona Lisa?', resposta: 'Leonardo da Vinci' },
  { pergunta: 'Qual a fórmula da água?', resposta: 'H2O' },
]

const jogos = new Map()

module.exports = {
  name: 'quiz',
  description: 'Jogo de perguntas e respostas',
  category: 'resenha',
  aliases: ['perguntas', 'trivia'],
  async execute({ reply, from, sender, args }) {
    const key = from
    const cmd = (args[0] || '').toLowerCase()

    if (cmd === 'sair') {
      jogos.delete(key)
      return reply('🚪 Quiz encerrado.')
    }

    if (!jogos.has(key) || cmd === 'novo') {
      const pergunta = perguntas[Math.floor(Math.random() * perguntas.length)]
      jogos.set(key, {
        pergunta: pergunta.pergunta,
        resposta: pergunta.resposta,
        tentativas: 3,
        player: sender
      })
      return reply(`📝 *QUIZ*\n\nPergunta: ${pergunta.pergunta}\n\nVocê tem 3 tentativas.\nUse: !quiz [resposta]`)
    }

    const jogo = jogos.get(key)
    const resposta = args.join(' ').toLowerCase().trim()
    if (!resposta) return reply('❗ Use: !quiz [sua resposta]')

    if (resposta === jogo.resposta.toLowerCase()) {
      jogos.delete(key)
      return reply(`🎉 *ACERTOU!*\n\nResposta: *${jogo.resposta}*\n\nParabéns! 🏆`)
    }

    jogo.tentativas--
    if (jogo.tentativas <= 0) {
      jogos.delete(key)
      return reply(`💀 Você perdeu!\n\nResposta correta: *${jogo.resposta}*`)
    }

    reply(`❌ Errou! Restam ${jogo.tentativas} tentativas.`)
  }
}
