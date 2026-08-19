module.exports = {
  name: 'listgrupos',
  description: 'Lista grupos que o bot está (dono)',
  category: 'dono',
  aliases: ['groups'],
  dono: true,
  async execute({ client, reply, isDono }) {
    if (!isDono) return reply('🔒 Só o dono.')
    try {
      const groups = await client.groupFetchAllParticipating()
      const list = Object.values(groups || {})
      let txt = `👥 *Grupos (${list.length})*\n\n`
      list.slice(0, 40).forEach((g, i) => {
        txt += `${i + 1}. ${g.subject || '?'}\n${g.id}\n\n`
      })
      if (list.length > 40) txt += '... e mais'
      await reply(txt)
    } catch (e) {
      await reply('❌ ' + e.message)
    }
  }
}
