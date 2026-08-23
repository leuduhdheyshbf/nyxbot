module.exports = {
  name: 'setnomegrupo',
  description: 'Altera o nome do grupo',
  category: 'admin',
  aliases: ['setnamegp'],
  admin: true,
  needBotAdmin: true,
  async execute({ client, from, reply, isGroup, isAdmin, isAdm, isBotAdmin, isBotAdm, q }) {
    if (!isGroup) return reply('❌ Só em grupo.')
    if (!(isAdmin || isAdm)) return reply('❌ Só admin.')
    if (!(isBotAdmin || isBotAdm)) return reply('❌ Bot precisa ser admin.')
    if (!q) return reply('❗ Use: .setnomegrupo Novo Nome')
    try {
      await client.groupUpdateSubject(from, q)
      await reply('✅ Nome do grupo atualizado.')
    } catch (e) { reply('❌ ' + e.message) }
  }
}
