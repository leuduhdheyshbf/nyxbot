module.exports = {
  name: 'chance',
  description: 'Calcula a chance de algo',
  category: 'utilidades',
  aliases: ['probabilidade'],
  async execute({ reply, q, pushname }) {
    if (!q) return reply('❗ Digite algo.\nEx: .chance de eu ficar rico')

    const pct = Math.floor(Math.random() * 101)
    let emoji = '😐'
    if (pct >= 80) emoji = '🔥'
    else if (pct >= 50) emoji = '✨'
    else if (pct >= 20) emoji = '😅'
    else emoji = '💀'

    reply(`${emoji} A chance de *${q}* é de *${pct}%*`)
  }
}
