module.exports = {
  name: 'punheta',
  description: 'Contador de zoação',
  category: 'adulto',
  aliases: ['punho'],
  async execute({ reply, pushname }) {
    const n = Math.floor(Math.random() * 50) + 1
    await reply(`🖐️ *${pushname || 'Você'}* já bateu *${n}x* hoje.\nDescansa o guerreiro 💀`)
  }
}
