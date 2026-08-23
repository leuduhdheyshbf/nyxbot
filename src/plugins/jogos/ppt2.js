module.exports = {
  name: 'ppt2',
  description: 'Pedra, papel e tesoura',
  category: 'jogos',
  aliases: ['jokenpo'],
  async execute({ reply, reagir, args }) {
    const user = (args[0] || '').toLowerCase()
    const opts = ['pedra', 'papel', 'tesoura']
    if (!opts.includes(user)) return reply('❗ Use: .ppt2 pedra|papel|tesoura')
    await reagir('✊')
    const bot = opts[Math.floor(Math.random() * 3)]
    let res = 'Empate!'
    if (user === bot) res = 'Empate!'
    else if ((user === 'pedra' && bot === 'tesoura') || (user === 'papel' && bot === 'pedra') || (user === 'tesoura' && bot === 'papel')) res = 'Você ganhou! 🎉'
    else res = 'Você perdeu 😈'
    await reply(`✊ Você: *${user}*\n🤖 Bot: *${bot}*\n\n${res}`)
  }
}
