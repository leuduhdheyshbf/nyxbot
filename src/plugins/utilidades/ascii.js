module.exports = {
  name: 'ascii',
  description: 'Código ASCII de um caractere',
  category: 'utilidades',
  aliases: [],
  async execute({ reply, args }) {
    const c = args[0]
    if (!c) return reply('❗ Use: .ascii A')
    await reply(`🔤 "${c[0]}" → ASCII ${c.charCodeAt(0)}`)
  }
}
