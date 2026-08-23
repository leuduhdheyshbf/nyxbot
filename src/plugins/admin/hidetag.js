module.exports = {
  name: 'hidetag',
  description: 'Marca todos sem mostrar a lista',
  category: 'admin',
  aliases: ['ht', 'notify'],
  async execute({ nyx, from, info, reply, reagir, isGroup, isAdm, isDono, q, groupMembers }) {
    if (!isGroup) return reply('❌ Só em grupos.')
    if (!isAdm && !isDono) return reply('❌ Só admins.')
    try {
      await reagir('📢')
      const mentions = (groupMembers || []).map(m => m.id || m)
      await nyx.sendMessage(from, {
        text: q || '📢 Aviso!',
        mentions
      }, { quoted: info })
      await reagir('✅')
    } catch {
      reply('❌ Erro.')
    }
  }
}
