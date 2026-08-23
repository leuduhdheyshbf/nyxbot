module.exports = {
  name: 'reiniciar',
  description: 'Encerra o processo do bot (dono)',
  category: 'dono',
  aliases: ['restart'],
  dono: true,
  async execute({ reply, isDono }) {
    if (!isDono) return reply('🔒 Só o dono.')
    await reply('♻️ Reiniciando...')
    setTimeout(() => process.exit(0), 1200)
  }
}
