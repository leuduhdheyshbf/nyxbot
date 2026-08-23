module.exports = {
  name: 'caracoroa',
  description: 'Cara ou coroa',
  category: 'resenha',
  aliases: ['moeda', 'coin'],
  async execute({ reply, reagir }) {
    await reagir('🪙')
    const r = Math.random() < 0.5 ? 'Cara' : 'Coroa'
    reply(`🪙 Deu: *${r}*`)
  }
}
