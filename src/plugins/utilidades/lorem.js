module.exports = {
  name: 'lorem',
  description: 'Gera Lorem Ipsum curto',
  category: 'utilidades',
  aliases: ['lipsum'],
  async execute({ reply, args }) {
    const n = Math.min(5, Math.max(1, parseInt(args[0], 10) || 1))
    const p = 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.'
    await reply(Array(n).fill(p).join('\n\n'))
  }
}
