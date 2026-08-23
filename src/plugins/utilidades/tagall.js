module.exports = {
  name: 'tagall',
  description: 'Marca todos os membros do grupo',
  category: 'utilidades',
  aliases: ['marcar', 'hidetag', 'todos'],
  async execute({ nyx, from, info, reply, reagir, isGroup, isAdm, isDono, q, groupMembers }) {
    if (!isGroup) return reply('❌ Só funciona em grupos.')
    if (!isAdm && !isDono) return reply('❌ Apenas administradores.')

    try {
      await reagir('📢')
      const members = groupMembers || []
      const mentions = members.map(m => m.id || m)

      const texto = q || '📢 Atenção todos!'
      let msg = `${texto}\n\n`
      for (const m of members) {
        const id = m.id || m
        msg += `› @${id.split('@')[0]}\n`
      }

      await nyx.sendMessage(from, {
        text: msg,
        mentions
      }, { quoted: info })

      await reagir('✅')
    } catch (e) {
      console.error(e)
      reply('❌ Erro ao marcar todos.')
    }
  }
}
