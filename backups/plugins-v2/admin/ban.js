module.exports = {
  name: 'ban',
  description: 'Remove um membro do grupo',
  category: 'admin',
  aliases: ['kick', 'expulsar'],

  async execute({ client, from, info, args, reply, isGroup, isAdm, sender, pushname }) {
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

    if (!botIsAdmin) return reply('❌ O bot precisa ser administrador do grupo para banir alguém!')

    // Pega o alvo (resposta ou menção)
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
      return reply('❗ Marque ou responda a mensagem de um usuário para remover.\nEx: !ban @usuario')
    }

    // Proteções básicas
    const botNumber = client.user?.id?.split(':')[0]
    if (target.includes(botNumber)) {
      return reply('❌ Eu não posso me banir!')
    }

    if (target === sender) {
      return reply('❌ Você não pode se banir!\nUse o comando de sair do grupo.')
    }

    try {
      await client.groupParticipantsUpdate(from, [target], 'remove')
      await client.sendMessage(
        from,
        {
          text: `✅ @${target.split('@')[0]} foi removido do grupo.`,
          mentions: [target]
        },
        { quoted: info }
      )
    } catch (error) {
      console.error('[ban]', error)
      reply(`❌ Erro ao tentar banir: ${error.message}`)
    }
  }
}
