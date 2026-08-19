module.exports = {
  name: 'contar',
  description: 'Conta caracteres e palavras',
  category: 'utilidades',
  aliases: ['count', 'chars'],
  async execute({ reply, q }) {
    if (!q) return reply('❗ Envie um texto.')
    const chars = q.length
    const words = q.trim() ? q.trim().split(/\s+/).length : 0
    await reply(`📝 Caracteres: *${chars}*\nWords: *${words}*`)
  }
}
