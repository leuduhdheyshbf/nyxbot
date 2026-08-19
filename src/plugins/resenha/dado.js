module.exports = {
  name: 'dado',
  description: 'Rola um dado',
  category: 'resenha',
  aliases: ['dice', 'rolar'],
  async execute({ reply, q }) {
    const faces = parseInt(q) || 6
    if (faces < 2 || faces > 100) return reply('❗ Use: .dado 6 (2 a 100)')
    const r = Math.floor(Math.random() * faces) + 1
    await reply(`🎲 Resultado: *${r}* (d${faces})`)
  }
}
