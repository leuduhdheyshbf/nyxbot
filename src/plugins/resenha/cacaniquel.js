module.exports = {
  name: 'cacaniquel',
  description: 'Caça-níquel',
  category: 'resenha',
  aliases: ['slot', 'slots', 'caçaníquel'],
  async execute({ reply }) {
    const emojis = ['🍒', '🍋', '🍊', '🍇', '💎', '🌟', '🎰', '7️⃣']
    const resultado = [
      emojis[Math.floor(Math.random() * emojis.length)],
      emojis[Math.floor(Math.random() * emojis.length)],
      emojis[Math.floor(Math.random() * emojis.length)]
    ]

    let texto = '🎰 *CAÇA-NÍQUEL*\n\n'
    texto += `[ ${resultado[0]} ] [ ${resultado[1]} ] [ ${resultado[2]} ]\n\n`

    if (resultado[0] === resultado[1] && resultado[1] === resultado[2]) {
      texto += '🎉 *JACKPOT! Você ganhou!* 🎉'
    } else if (resultado[0] === resultado[1] || resultado[1] === resultado[2] || resultado[0] === resultado[2]) {
      texto += '🎯 *Quase! Tente novamente!*'
    } else {
      texto += '😔 *Tente novamente!*'
    }

    reply(texto)
  }
}
