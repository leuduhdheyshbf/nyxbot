module.exports = {
  name: 'listadmin',
  description: 'Lista os admins do grupo',
  category: 'admin',
  aliases: ['admins', 'adminlist'],
  async execute({ nyx, from, reply, reagir, isGroup, groupAdmins, groupMembers }) {
    if (!isGroup) return reply('❌ Só em grupos.')
    await reagir('👑')
    const admins = groupAdmins || []
    if (!admins.length) return reply('Nenhum admin encontrado.')
    let text = '👑 *Admins do grupo*\n\n'
    admins.forEach((id, i) => { text += `${i+1}. @${id.split('@')[0]}\n` })
    await nyx.sendMessage(from, { text, mentions: admins })
  }
}
