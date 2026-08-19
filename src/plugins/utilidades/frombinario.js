module.exports = {
  name: 'frombinario',
  description: 'Binário → texto',
  category: 'utilidades',
  aliases: ['unbinary'],
  async execute({ reply, q }) {
    if (!q) return reply('❗ Envie binário (ex: 01001000 01101001)')
    try {
      const text = q.trim().split(/\s+/).map(b => String.fromCharCode(parseInt(b, 2))).join('')
      await reply('🔤 ' + text)
    } catch {
      await reply('❌ Binário inválido.')
    }
  }
}
