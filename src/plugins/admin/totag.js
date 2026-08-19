module.exports = {
  name: 'totag',
  description: 'Marca todos com o texto/mídia respondida',
  category: 'admin',
  aliases: ['hidetag2'],
  admin: true,
  async execute({ client, from, info, reply, isGroup, isAdmin, isAdm, groupMembers, q }) {
    if (!isGroup) return reply('❌ Só em grupo.')
    if (!(isAdmin || isAdm)) return reply('❌ Só admin.')
    const members = (groupMembers || []).map(m => m.id || m).filter(Boolean)
    const text = q || '📢'
    await client.sendMessage(from, { text, mentions: members }, { quoted: info })
  }
}
