module.exports = {
  name: 'deb64',
  description: 'Decodifica Base64',
  category: 'utilidades',
  aliases: ['unb64'],
  async execute({ reply, q }) {
    if (!q) return reply('❗ Envie um Base64.')
    try {
      await reply('📦 ' + Buffer.from(q, 'base64').toString('utf8'))
    } catch {
      await reply('❌ Base64 inválido.')
    }
  }
}
