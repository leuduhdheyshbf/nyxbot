module.exports = {
  name: 'join',
  description: 'Entra em grupo via link (dono)',
  category: 'dono',
  aliases: ['entrar'],
  dono: true,
  async execute({ client, reply, args, isDono }) {
    if (!isDono) return reply('🔒 Só o dono.')
    const link = args[0] || ''
    const code = link.replace('https://chat.whatsapp.com/', '').trim()
    if (!code) return reply('❗ Use: .join https://chat.whatsapp.com/xxxxx')
    try {
      await client.groupAcceptInvite(code)
      await reply('✅ Entrei no grupo.')
    } catch (e) {
      await reply('❌ ' + e.message)
    }
  }
}
