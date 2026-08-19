module.exports = {
  name: 'anagrama',
  description: 'Embaralha uma palavra',
  category: 'jogos',
  aliases: ['embaralhar'],
  async execute({ reply, q }) {
    if (!q) return reply('❗ Use: .anagrama palavra')
    const arr = [...q]
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1))
      ;[arr[i], arr[j]] = [arr[j], arr[i]]
    }
    await reply('🔤 ' + arr.join(''))
  }
}
