module.exports = {
  name: 'data',
  description: 'Data de hoje',
  category: 'utilidades',
  aliases: ['hoje'],
  async execute({ reply }) {
    const d = new Date().toLocaleDateString('pt-BR', { timeZone: 'America/Sao_Paulo', weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })
    await reply('📅 ' + d)
  }
}
