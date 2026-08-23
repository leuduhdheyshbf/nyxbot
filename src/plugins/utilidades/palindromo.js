module.exports = {
  name: 'palindromo',
  description: 'Verifica se é palíndromo',
  category: 'utilidades',
  aliases: ['palindrome'],
  async execute({ reply, q }) {
    if (!q) return reply('❗ Envie um texto.')
    const s = q.toLowerCase().replace(/[^a-z0-9à-ü]/gi, '')
    const ok = s === [...s].reverse().join('')
    await reply(ok ? '✅ É palíndromo!' : '❌ Não é palíndromo.')
  }
}
