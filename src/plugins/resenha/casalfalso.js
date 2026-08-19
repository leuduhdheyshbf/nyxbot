module.exports = {
  name: 'casalfalso',
  description: 'Monta um casal aleatório no grupo',
  category: 'resenha',
  aliases: ['fakeCouple'],
  async execute({ client, from, info, reply, reagir, isGroup, groupMembers }) {
    if (!isGroup) return reply('❗ Só em grupo.')
    await reagir('💍')
    const members = (groupMembers || []).map(m => m.id || m).filter(Boolean)
    if (members.length < 2) return reply('❗ Precisa de mais membros.')
    let a = members[Math.floor(Math.random() * members.length)]
    let b = members[Math.floor(Math.random() * members.length)]
    while (b === a) b = members[Math.floor(Math.random() * members.length)]
    const pct = Math.floor(Math.random() * 101)
    await client.sendMessage(from, {
      text: `💍 *Casal do momento*\n@${a.split('@')[0]} ❤️ @${b.split('@')[0]}\nCompatibilidade: *${pct}%*`,
      mentions: [a, b]
    }, { quoted: info })
  }
}
