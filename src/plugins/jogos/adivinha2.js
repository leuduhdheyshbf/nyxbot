const states = global.__nyxAdivinha2 || (global.__nyxAdivinha2 = new Map())
module.exports = {
  name: 'adivinha2',
  description: 'Adivinhe o número 1-50',
  category: 'jogos',
  aliases: ['guess'],
  async execute({ reply, reagir, args, sender }) {
    await reagir('🔢')
    const key = sender
    if (!args[0]) {
      const n = Math.floor(Math.random() * 50) + 1
      states.set(key, n)
      return reply('🔢 Pensei num número de 1 a 50. Tente com .adivinha2 <n>')
    }
    const secret = states.get(key)
    if (!secret) return reply('❗ Comece com .adivinha2')
    const guess = parseInt(args[0], 10)
    if (guess === secret) {
      states.delete(key)
      return reply('🎉 Acertou! Era ' + secret)
    }
    await reply(guess < secret ? '⬆️ Maior' : '⬇️ Menor')
  }
}
