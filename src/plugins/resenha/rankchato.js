module.exports = {
  name: 'rankchato',
  description: 'Rank chato do grupo (aleatório)',
  category: 'resenha',
  aliases: [],
  async execute({ client, from, info, reply, reagir, isGroup, groupMembers }) {
    if (!isGroup) return reply('❗ Só em grupo.')
    await reagir('😤')
    const members = (groupMembers || []).map(m => m.id || m).filter(Boolean)
    if (members.length < 3) return reply('❗ Grupo muito pequeno.')
    const shuffled = [...members].sort(() => Math.random() - 0.5).slice(0, 10)
    let txt = `😤 *TOP CHATO*\n\n`
    shuffled.forEach((m, i) => {
      txt += `${i + 1}. @${String(m).split('@')[0]} — ${Math.floor(Math.random() * 101)}%\n`
    })
    await client.sendMessage(from, { text: txt, mentions: shuffled }, { quoted: info })
  }
}
