module.exports = {
  name: 'ppt',
  description: 'Pedra, papel ou tesoura',
  category: 'resenha',
  aliases: ['jokenpo', 'pedrapapeltesoura'],
  async execute({ reply, reagir, args }) {
    const escolha = (args[0] || '').toLowerCase()
    const ops = ['pedra', 'papel', 'tesoura']
    if (!ops.includes(escolha)) return reply('❗ Use: .ppt pedra | papel | tesoura')
    await reagir('✊')
    const bot = ops[Math.floor(Math.random() * 3)]
    let result = 'Empate! 😐'
    if (
      (escolha === 'pedra' && bot === 'tesoura') ||
      (escolha === 'papel' && bot === 'pedra') ||
      (escolha === 'tesoura' && bot === 'papel')
    ) result = 'Você ganhou! 🎉'
    else if (escolha !== bot) result = 'Você perdeu! 😢'
    reply(`✊ *Jokenpô*\n\nVocê: *${escolha}*\nBot: *${bot}*\n\n${result}`)
  }
}
