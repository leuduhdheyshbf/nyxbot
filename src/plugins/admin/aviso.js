module.exports = {
  name: 'aviso',
  description: 'Envia aviso formatado no grupo',
  category: 'admin',
  aliases: ['announce'],
  admin: true,
  async execute({ client, from, info, reply, isGroup, isAdmin, isAdm, q }) {
    if (!isGroup) return reply('❌ Só em grupo.')
    if (!(isAdmin || isAdm)) return reply('❌ Só admin.')
    if (!q) return reply('❗ Use: .aviso texto')
    await client.sendMessage(from, { text: '📢 *AVISO*\n\n' + q }, { quoted: info })
  }
}
