module.exports = {
  name: 'quem',
  description: 'Escolhe alguém aleatório do grupo',
  category: 'resenha',
  aliases: ['who'],
  async execute({ client, from, info, reply, reagir, isGroup, groupMembers, q }) {
    if (!isGroup) return reply('❗ Só em grupo.')
    await reagir('👀')
    const members = (groupMembers || []).map(m => m.id || m).filter(Boolean)
    if (!members.length) return reply('❗ Sem membros.')
    const pick = members[Math.floor(Math.random() * members.length)]
    const pergunta = q || 'foi o escolhido'
    await client.sendMessage(from, {
      text: `👀 Quem ${pergunta}?\n\n👉 @${pick.split('@')[0]}`,
      mentions: [pick]
    }, { quoted: info })
  }
}
