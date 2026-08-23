module.exports = {
  name: 'block',
  description: 'Bloqueia um número (dono)',
  category: 'dono',
  aliases: ['bloquear'],
  dono: true,
  async execute({ client, from, info, reply, args, isDono }) {
    if (!isDono) return reply('🔒 Só o dono.')
    const quoted = info.message?.extendedTextMessage?.contextInfo
    let target = quoted?.participant || quoted?.mentionedJid?.[0]
    if (!target && args[0]) {
      const n = args[0].replace(/\D/g, '')
      if (n.length >= 10) target = n + '@s.whatsapp.net'
    }
    if (!target) return reply('❗ Marque ou informe o número.')
    try {
      await client.updateBlockStatus(target, 'block')
      await reply('🚫 Bloqueado: @' + target.split('@')[0])
    } catch (e) {
      await reply('❌ ' + e.message)
    }
  }
}
