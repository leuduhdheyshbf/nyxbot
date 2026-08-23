module.exports = {
  name: 'horario',
  description: 'Horário atual (Brasil)',
  category: 'utilidades',
  aliases: ['hora', 'time'],
  async execute({ reply, reagir }) {
    await reagir('🕐')
    const now = new Date().toLocaleString('pt-BR', { timeZone: 'America/Sao_Paulo' })
    await reply('🕐 ' + now + ' (America/Sao_Paulo)')
  }
}
