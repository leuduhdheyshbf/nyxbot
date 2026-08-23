module.exports = {
  name: 'ppp',
  description: 'Pedra papel tesoura',
  category: 'utilidades',
  aliases: ['jokenpo', 'ppt'],
  async execute({ reply, q, pushname }) {
    const ops = ['pedra', 'papel', 'tesoura']
    const user = (q || '').toLowerCase().trim()
    if (!ops.includes(user)) return reply('❗ Use: .ppt pedra|papel|tesoura')
    const bot = ops[Math.floor(Math.random() * 3)]
    let res = 'Empate!'
    if (user === bot) res = 'Empate! 😐'
    else if ((user === 'pedra' && bot === 'tesoura') || (user === 'papel' && bot === 'pedra') || (user === 'tesoura' && bot === 'papel'))
      res = 'Você ganhou! 🎉'
    else res = 'Nyx ganhou! 😈'
    await reply(`✊ *PPT*\nVocê: *${user}*\nNyx: *${bot}*\n\n${res}`)
  }
}
