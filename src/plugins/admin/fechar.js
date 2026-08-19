module.exports = {
  name: 'fechar',
  description: 'Fecha o grupo (só admin fala)',
  category: 'admin',
  aliases: ['close', 'grupofechar'],
  async execute({ nyx, from, reply, reagir, isGroup, isAdm, isDono, isBotAdm }) {
    if (!isGroup) return reply('❌ Só em grupos.')
    if (!isAdm && !isDono) return reply('❌ Só admins.')
    if (!isBotAdm) return reply('❌ Preciso ser admin.')
    await nyx.groupSettingUpdate(from, 'announcement')
    await reagir('✅')
    reply('🔒 Grupo *fechado*! Só admins podem enviar mensagens.')
  }
}
