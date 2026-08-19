module.exports = {
  name: 'bcgrupo',
  description: 'Broadcast só para grupos (dono)',
  category: 'dono',
  aliases: ['bcg'],
  dono: true,
  async execute({ client, reply, q, isDono }) {
    if (!isDono) return reply('🔒 Só o dono.')
    if (!q) return reply('❗ Use: .bcgrupo mensagem')
    try {
      const groups = await client.groupFetchAllParticipating()
      const ids = Object.keys(groups || {})
      let ok = 0
      for (const id of ids) {
        try {
          await client.sendMessage(id, { text: '📢 ' + q })
          ok++
        } catch {}
      }
      await reply(`✅ Enviado para ${ok}/${ids.length} grupos.`)
    } catch (e) {
      await reply('❌ ' + e.message)
    }
  }
}
