module.exports = {
  name: 'minuscula',
  description: 'Converte texto para minúsculo',
  category: 'utilidades',
  aliases: ['lower'],
  async execute({ reply, q }) {
    if (!q) return reply('❗ Envie um texto.')
    await reply(q.toLowerCase())
  }
}
