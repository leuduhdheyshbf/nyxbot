module.exports = {
  name: 'abrir',
  description: 'Abre o grupo (todos podem falar)',
  category: 'admin',
  aliases: ['open', 'grupoabrir'],
  async execute({ nyx, from, reply, reagir, isGroup, isAdm, isDono, isBotAdm }) {
    if (!isGroup) return reply('❌ Só em grupos.')
    if (!isAdm && !isDono) return reply('❌ Só admins.')
    if (!isBotAdm) return reply('❌ Preciso ser admin.')
    await nyx.groupSettingUpdate(from, 'not_announcement')
    await reagir('✅')
    reply('🔓 Grupo *aberto*! Todos podem enviar mensagens.')
  }
}
