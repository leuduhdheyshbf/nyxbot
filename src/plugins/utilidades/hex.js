module.exports = {
  name: 'hex',
  description: 'Texto → hexadecimal',
  category: 'utilidades',
  aliases: ['tohex'],
  async execute({ reply, q }) {
    if (!q) return reply('❗ Envie um texto.')
    await reply('#️⃣ ' + Buffer.from(q, 'utf8').toString('hex'))
  }
}
