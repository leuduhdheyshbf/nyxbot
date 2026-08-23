module.exports = {
  name: 'link',
  description: 'Pega o link do grupo',
  category: 'admin',
  aliases: ['linkgrupo', 'invite'],
  async execute({ nyx, from, reply, reagir, isGroup, isAdm, isDono, isBotAdm }) {
    if (!isGroup) return reply('❌ Só em grupos.')
    if (!isAdm && !isDono) return reply('❌ Só admins.')
    if (!isBotAdm) return reply('❌ Preciso ser admin.')
    try {
      await reagir('🔗')
      const code = await nyx.groupInviteCode(from)
      reply(`🔗 Link do grupo:\nhttps://chat.whatsapp.com/${code}`)
    } catch {
      reply('❌ Erro ao pegar o link.')
    }
  }
}
