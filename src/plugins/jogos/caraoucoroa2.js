module.exports = {
  name: 'caraoucoroa2',
  description: 'Cara ou coroa',
  category: 'jogos',
  aliases: ['coinflip2'],
  async execute({ reply, reagir }) {
    await reagir('🪙')
    await reply('🪙 ' + (Math.random() < 0.5 ? '*Cara*' : '*Coroa*'))
  }
}
