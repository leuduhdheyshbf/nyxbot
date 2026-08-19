module.exports = {
  name: 'listonline',
  description: 'Tenta listar membros (fallback: todos)',
  category: 'admin',
  aliases: ['online'],
  admin: true,
  async execute({ client, from, info, reply, isGroup, isAdmin, isAdm, groupMembers }) {
    if (!isGroup) return reply('❌ Só em grupo.')
    if (!(isAdmin || isAdm)) return reply('❌ Só admin.')
    const members = (groupMembers || []).map(m => m.id || m).filter(Boolean)
    let txt = `👥 Membros visíveis: ${members.length}\n\n`
    members.slice(0, 30).forEach((m, i) => { txt += `${i + 1}. @${String(m).split('@')[0]}\n` })
    await client.sendMessage(from, { text: txt, mentions: members.slice(0, 30) }, { quoted: info })
  }
}
