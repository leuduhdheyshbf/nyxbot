module.exports = {
  name: 'quando',
  description: 'Prevê quando algo vai acontecer (zoeira)',
  category: 'resenha',
  aliases: ['when'],
  async execute({ reply, reagir, q }) {
    if (!q) return reply('❗ Use: .quando vou ficar rico')
    await reagir('📅')
    const opcoes = ['hoje', 'amanhã', 'essa semana', 'esse mês', 'esse ano', 'nunca', 'já aconteceu e você não viu', 'em 3 dias', 'quando menos esperar']
    const pick = opcoes[Math.floor(Math.random() * opcoes.length)]
    await reply(`📅 *${q}*\nPrevisão: *${pick}*`)
  }
}
