module.exports = {
  name: 'limpar',
  description: 'Envia linhas em branco (limpar visual)',
  category: 'admin',
  aliases: ['clear'],
  admin: true,
  async execute({ reply, isGroup, isAdmin, isAdm }) {
    if (!isGroup) return reply('❌ Só em grupo.')
    if (!(isAdmin || isAdm)) return reply('❌ Só admin.')
    await reply('\n'.repeat(40) + '🧹 Chat "limpo" (visual).')
  }
}
