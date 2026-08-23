module.exports = {
  name: 'dado20',
  description: 'Rola um D20',
  category: 'jogos',
  aliases: ['d20'],
  async execute({ reply, reagir }) {
    await reagir('🎲')
    const n = Math.floor(Math.random() * 20) + 1
    let extra = ''
    if (n === 20) extra = ' — CRÍTICO!'
    if (n === 1) extra = ' — FALHA CRÍTICA'
    await reply('🎲 D20: *' + n + '*' + extra)
  }
}
