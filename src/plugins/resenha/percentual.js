module.exports = {
  name: 'percentual',
  description: 'Porcentagem aleatória sobre qualquer coisa',
  category: 'resenha',
  aliases: ['pct', 'porcentagem'],
  async execute({ reply, reagir, args, q }) {
    if (!q) return reply('❗ Use: .percentual chance de chover')
    await reagir('📊')
    const pct = Math.floor(Math.random() * 101)
    await reply(`📊 *${q}*\nResultado: *${pct}%*`)
  }
}
