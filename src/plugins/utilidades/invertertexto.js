module.exports = {
  name: 'invertertexto',
  description: 'Inverte o texto',
  category: 'utilidades',
  aliases: ['reverse', 'inverter'],
  async execute({ reply, q }) {
    if (!q) return reply('❗ Envie um texto.')
    await reply([...q].reverse().join(''))
  }
}
