const palavras = ['javascript','whatsapp','figurinha','programacao','computador','internet','celular','android','bot','grupo','sticker','musica','video','imagem','codigo']
const jogos = new Map()

module.exports = {
  name: 'forca',
  description: 'Jogo da forca',
  category: 'resenha',
  aliases: ['hangman'],
  async execute({ reply, reagir, from, sender, args }) {
    const key = from
    const cmd = (args[0]||'').toLowerCase()

    if (cmd === 'sair') {
      jogos.delete(key)
      return reply('🚪 Jogo encerrado.')
    }

    if (!jogos.has(key) || cmd === 'novo') {
      const palavra = palavras[Math.floor(Math.random()*palavras.length)]
      jogos.set(key, { palavra, tentativas: 6, letras: [], player: sender })
      await reagir('🎮')
      return reply(`🎮 *Jogo da Forca*\n\n${'_ '.repeat(palavra.length)}\n\n❤️ Tentativas: 6\nDigite: .forca letra`)
    }

    const jogo = jogos.get(key)
    const letra = (args[0]||'').toLowerCase()
    if (!letra || letra.length !== 1) return reply('❗ Use: .forca a')

    if (jogo.letras.includes(letra)) return reply('Já tentou essa letra.')

    jogo.letras.push(letra)
    if (!jogo.palavra.includes(letra)) {
      jogo.tentativas--
      if (jogo.tentativas <= 0) {
        jogos.delete(key)
        return reply(`💀 Perdeu! A palavra era: *${jogo.palavra}*`)
      }
    }

    const display = jogo.palavra.split('').map(c => jogo.letras.includes(c) ? c : '_').join(' ')
    if (!display.includes('_')) {
      jogos.delete(key)
      await reagir('🎉')
      return reply(`🎉 *Acertou!*\nPalavra: *${jogo.palavra}*`)
    }
    reply(`🎮 ${display}\n\n❤️ Tentativas: ${jogo.tentativas}\nLetras: ${jogo.letras.join(', ')}`)
  }
}
