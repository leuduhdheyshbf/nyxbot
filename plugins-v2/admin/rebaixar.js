module.exports = {
  name: 'rebaixar',
  description: 'Rebaixa um administrador a membro',
  category: 'admin',
  aliases: ['demote', 'despromover'],

  async execute({ client, from, info, args, reply, isGroup, isAdm, sender }) {
    if (!isGroup) return reply('❌ Este comando só pode ser usado em grupos!')
    if (!isAdm) return reply('❌ Apenas administradores podem usar este comando!')

    // Verifica se o bot é admin
    let botIsAdmin = false
    try {
      const meta = await client.groupMetadata(from)
      const botId = client.user?.id?.split(':')[0] + '@s.whatsapp.net'
      const botParticipant = meta.participants.find(p =>
        p.id === botId || p.id?.includes(client.user?.id?.split(':')[0])
      )
      botIsAdmin = botParticipant?.admin === 'admin' || botParticipant?.admin === 'superadmin'
    } catch (e) {}

    if (!botIsAdmin) return reply('❌ O bot precisa ser administrador do grupo para rebaixar alguém!')

    const quoted = info.message?.extendedTextMessage?.contextInfo
    let target =
      quoted?.participant ||
      quoted?.mentionedJid?.[0] ||
      info.message?.extendedTextMessage?.contextInfo?.mentionedJid?.[0]

    if (!target && args[0]) {
      const num = args[0].replace(/[^0-9]/g, '')
      if (num.length >= 10) target = num + '@s.whatsapp.net'
    }

    if (!target) {
      return reply('❗ Marque ou responda a mensagem de um usuário para rebaixar.\nEx: !rebaixar @usuario')
    }

    const botNumber = client.user?.id?.split(':')[0]
    if (target.includes(botNumber)) {
      return reply('❌ Eu não posso me rebaixar!')
    }

    if (target === sender) {
      return reply('❌ Você não pode se rebaixar!')
    }

    try {
      const meta = await client.groupMetadata(from)
      const member = meta.participants.find(p => p.id === target)

      if (!member) {
        return reply('❌ Este usuário não está no grupo!')
      }

      if (member.admin !== 'admin' && member.admin !== 'superadmin') {
        return reply('❌ Este usuário não é administrador!')
      }

      await client.groupParticipantsUpdate(from, [target], 'demote')
      await client.sendMessage(
        from,
        {
          text: `✅ @${target.split('@')[0]} foi rebaixado a membro comum!`,
          mentions: [target]
        },
        { quoted: info }
      )
    } catch (error) {
      console.error('[rebaixar]', error)
      reply(`❌ Erro ao tentar rebaixar: ${error.message}`)
    }
  }
}
