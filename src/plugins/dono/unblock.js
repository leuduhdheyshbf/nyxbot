module.exports = {
  name: 'unblock',
  description: 'Desbloqueia um número (dono)',
  category: 'dono',
  aliases: ['desbloquear'],
  dono: true,
  async execute({ client, info, reply, args, isDono }) {
    if (!isDono) return reply('🔒 Só o dono.')
    const quoted = info.message?.extendedTextMessage?.contextInfo
    let target = quoted?.participant || quoted?.mentionedJid?.[0]
    if (!target && args[0]) {
      const n = args[0].replace(/\D/g, '')
      if (n.length >= 10) target = n + '@s.whatsapp.net'
    }
    if (!target) return reply('❗ Marque ou informe o número.')
    try {
      await client.updateBlockStatus(target, 'unblock')
      await reply('✅ Desbloqueado: @' + target.split('@')[0])
    } catch (e) {
      await reply('❌ ' + e.message)
    }
  }
}
