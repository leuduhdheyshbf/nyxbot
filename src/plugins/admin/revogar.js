module.exports = {
  name: 'revogar',
  description: 'Revoga o link do grupo',
  category: 'admin',
  aliases: ['resetlink', 'revokelink'],
  async execute({ nyx, from, reply, reagir, isGroup, isAdm, isDono, isBotAdm }) {
    if (!isGroup) return reply('❌ Só em grupos.')
    if (!isAdm && !isDono) return reply('❌ Só admins.')
    if (!isBotAdm) return reply('❌ Preciso ser admin.')
    try {
      await reagir('🔄')
      await nyx.groupRevokeInvite(from)
      const code = await nyx.groupInviteCode(from)
      reply(`✅ Link revogado!\nNovo link:\nhttps://chat.whatsapp.com/${code}`)
    } catch {
      reply('❌ Erro ao revogar.')
    }
  }
}
