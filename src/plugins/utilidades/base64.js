module.exports = {
  name: 'base64',
  description: 'Codifica texto em Base64',
  category: 'utilidades',
  aliases: ['b64'],
  async execute({ reply, q }) {
    if (!q) return reply('❗ Envie um texto.')
    await reply('📦 ' + Buffer.from(q, 'utf8').toString('base64'))
  }
}
