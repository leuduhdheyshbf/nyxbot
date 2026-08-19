module.exports = {
  name: 'binario',
  description: 'Texto → binário',
  category: 'utilidades',
  aliases: ['binary'],
  async execute({ reply, q }) {
    if (!q) return reply('❗ Envie um texto.')
    const bin = [...q].map(c => c.charCodeAt(0).toString(2).padStart(8, '0')).join(' ')
    await reply('01 ' + (bin.length > 3000 ? bin.slice(0, 3000) + '…' : bin))
  }
}
