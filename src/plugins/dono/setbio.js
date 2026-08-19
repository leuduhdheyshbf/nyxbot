module.exports = {
  name: 'setbio',
  description: 'Altera a bio/status do bot (dono)',
  category: 'dono',
  aliases: ['botbio'],
  dono: true,
  async execute({ client, reply, q, isDono }) {
    if (!isDono) return reply('🔒 Só o dono.')
    if (!q) return reply('❗ Use: .setbio texto')
    try {
      // Baileys: updateProfileStatus se disponível
      if (typeof client.updateProfileStatus === 'function') {
        await client.updateProfileStatus(q)
        await reply('✅ Bio atualizada.')
      } else {
        await reply('⚠️ Seu Baileys pode não expor updateProfileStatus. Texto: ' + q)
      }
    } catch (e) {
      await reply('❌ ' + e.message)
    }
  }
}
