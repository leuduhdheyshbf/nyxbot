module.exports = {
  name: 'promover',
  description: 'Promove um membro a administrador',
  category: 'admin',
  aliases: ['promote', 'elevar'],

  async execute({ client, from, info, args, reply, isGroup, isAdmin, isAdm, isBotAdmin, isBotAdm }) {
    const adm = isAdmin || isAdm
    const botAdm = isBotAdmin || isBotAdm

    if (!isGroup) return reply('❌ Este comando só pode ser usado em grupos!')
    if (!adm) return reply('❌ Apenas administradores podem usar este comando!')
    if (!botAdm) return reply('❌ O bot precisa ser administrador do grupo!')

    const quoted = info.message?.extendedTextMessage?.contextInfo
    let target = quoted?.participant || quoted?.mentionedJid?.[0]

    if (!target && args[0]) {
      const num = args[0].replace(/[^0-9]/g, '')
      if (num.length >= 10) target = num + '@s.whatsapp.net'
    }

    if (!target) return reply('❗ Marque ou responda a mensagem de um usuário.\nEx: .promover @usuario')

    try {
      const meta = await client.groupMetadata(from)
      const member = meta.participants.find(p => p.id === target)
      if (member && (member.admin === 'admin' || member.admin === 'superadmin')) {
        return reply('❌ Este usuário já é administrador!')
      }

      await client.groupParticipantsUpdate(from, [target], 'promote')
      await client.sendMessage(
        from,
        { text: `✅ @${target.split('@')[0]} foi promovido a administrador!`, mentions: [target] },
        { quoted: info }
      )
    } catch (error) {
      console.error('[promover]', error)
      reply(`❌ Erro ao promover: ${error.message}`)
    }
  }
}
