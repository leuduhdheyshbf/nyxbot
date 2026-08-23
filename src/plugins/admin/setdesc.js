module.exports = {
  name: 'setdesc',
  description: 'Altera descrição do grupo',
  category: 'admin',
  aliases: ['setdescricao'],
  admin: true,
  needBotAdmin: true,
  async execute({ client, from, reply, isGroup, isAdmin, isAdm, isBotAdmin, isBotAdm, q }) {
    if (!isGroup) return reply('❌ Só em grupo.')
    if (!(isAdmin || isAdm)) return reply('❌ Só admin.')
    if (!(isBotAdmin || isBotAdm)) return reply('❌ Bot precisa ser admin.')
    if (!q) return reply('❗ Use: .setdesc texto')
    try {
      await client.groupUpdateDescription(from, q)
      await reply('✅ Descrição atualizada.')
    } catch (e) { reply('❌ ' + e.message) }
  }
}
