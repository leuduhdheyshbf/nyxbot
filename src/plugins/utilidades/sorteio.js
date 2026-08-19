module.exports = {
  name: 'sorteio',
  description: 'Sorteia um membro do grupo',
  category: 'utilidades',
  aliases: ['sortear', 'random'],
  async execute({ nyx, from, reply, reagir, isGroup, groupMembers, q }) {
    if (!isGroup) return reply('❌ Só funciona em grupos.')

    try {
      const members = (groupMembers || []).filter(m => {
        const id = m.id || m
        return id && !id.includes('status')
      })

      if (members.length < 2) return reply('❌ Grupo muito pequeno.')

      await reagir('🎲')
      const escolhido = members[Math.floor(Math.random() * members.length)]
      const id = escolhido.id || escolhido
      const motivo = q ? `\n🎯 Motivo: ${q}` : ''

      await nyx.sendMessage(from, {
        text: `🎲 *SORTEIO*\n\n🏆 Ganhador: @${id.split('@')[0]}${motivo}`,
        mentions: [id]
      })
      await reagir('✅')
    } catch (e) {
      reply('❌ Erro no sorteio.')
    }
  }
}
