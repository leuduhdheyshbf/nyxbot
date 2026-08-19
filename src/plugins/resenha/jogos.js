module.exports = {
  name: 'jogos',
  description: 'Lista rápida de jogos',
  category: 'resenha',
  aliases: ['games'],

  async execute({ reply, prefix }) {
    const p = prefix || '.'
    await reply(
      `🎮 *JOGOS DISPONÍVEIS*\n\n` +
        `${p}velha — Jogo da velha\n` +
        `${p}forca — Forca\n` +
        `${p}memoria — Memória\n` +
        `${p}adivinha — Adivinhe o número\n` +
        `${p}quiz — Quiz\n` +
        `${p}dado / ${p}moeda — Sorte\n` +
        `${p}ppt — Pedra papel tesoura\n` +
        `${p}blackjack — 21\n` +
        `${p}batalha — Batalha\n` +
        `${p}bingo — Bingo\n` +
        `${p}cacaniquel — Caça-níquel\n` +
        `${p}loteria — Loteria\n` +
        `${p}corrida — Corrida\n\n` +
        `➤ Menu completo: *${p}brincadeiras*`
    )
  }
}
