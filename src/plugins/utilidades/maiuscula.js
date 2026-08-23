module.exports = {
  name: 'maiuscula',
  description: 'Converte texto para MAIÚSCULO',
  category: 'utilidades',
  aliases: ['upper', 'caps'],
  async execute({ reply, q }) {
    if (!q) return reply('❗ Envie um texto.')
    await reply(q.toUpperCase())
  }
}
