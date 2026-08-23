module.exports = {
  name: 'escolher',
  description: 'Escolhe entre opções separadas por |',
  category: 'resenha',
  aliases: ['decide', 'ou'],
  async execute({ reply, reagir, q }) {
    if (!q || !q.includes('|')) return reply('❗ Use: .escolher pizza | hamburger | sushi')
    await reagir('🎲')
    const opts = q.split('|').map(s => s.trim()).filter(Boolean)
    if (opts.length < 2) return reply('❗ Precisa de pelo menos 2 opções.')
    const pick = opts[Math.floor(Math.random() * opts.length)]
    await reply(`🎲 Eu escolho: *${pick}*`)
  }
}
