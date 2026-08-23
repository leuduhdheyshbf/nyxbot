module.exports = {
  name: 'simnao',
  description: 'Responde sim ou não',
  category: 'resenha',
  aliases: ['sn', 'yesno'],
  async execute({ reply, reagir, q }) {
    if (!q) return reply('❗ Faça uma pergunta.\nEx: .simnao vai dar certo?')
    await reagir('🎱')
    const r = Math.random() < 0.5 ? '✅ *SIM*' : '❌ *NÃO*'
    await reply(`🎱 ${q}\n\nResposta: ${r}`)
  }
}
