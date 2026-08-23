module.exports = {
  name: 'moeda',
  description: 'Cara ou coroa',
  category: 'resenha',
  aliases: ['caracoroa', 'coin'],
  async execute({ reply }) {
    const r = Math.random() < 0.5 ? '🪙 Cara' : '🪙 Coroa'
    await reply(r)
  }
}
