module.exports = {
  name: 'broadcast',
  description: 'Envia msg para todos os grupos (dono)',
  category: 'dono',
  aliases: ['bc', 'transmitir'],
  async execute({ nyx, reply, reagir, isDono, q }) {
    if (!isDono) return reply('❌ Só o dono.')
    if (!q) return reply('❗ Use: .broadcast sua mensagem')
    try {
      await reagir('📢')
      const groups = await nyx.groupFetchAllParticipating()
      const ids = Object.keys(groups)
      let ok = 0
      for (const id of ids) {
        try {
          await nyx.sendMessage(id, { text: `📢 *Comunicado*\n\n${q}` })
          ok++
          await new Promise(r => setTimeout(r, 1500))
        } catch {}
      }
      reply(`✅ Enviado para ${ok}/${ids.length} grupos.`)
    } catch (e) {
      reply('❌ Erro no broadcast.')
    }
  }
}
