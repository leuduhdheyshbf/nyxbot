module.exports = {
  name: 'idade',
  description: 'Calcula idade a partir do ano de nascimento',
  category: 'utilidades',
  aliases: ['age'],
  async execute({ reply, args }) {
    const year = parseInt(args[0], 10)
    if (!year || year < 1900) return reply('❗ Use: .idade 2000')
    const now = new Date().getFullYear()
    await reply(`🎂 Idade aproximada: *${now - year}* anos`)
  }
}
