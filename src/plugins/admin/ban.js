module.exports = {
  name: 'ban',
  description: 'Remove um membro do grupo',
  category: 'admin',
  aliases: ['kick', 'expulsar'],

  async execute({ client, from, info, args, reply, isGroup, isAdmin, isAdm, isBotAdmin, isBotAdm, sender }) {
    const adm = isAdmin || isAdm
    const botAdm = isBotAdmin || isBotAdm

    if (!isGroup) return reply('❌ Este comando só pode ser usado em grupos!')
    if (!adm) return reply('❌ Apenas administradores podem usar este comando!')
    if (!botAdm) return reply('❌ O bot precisa ser administrador do grupo!')

    const quoted = info.message?.extendedTextMessage?.contextInfo
    let target =
      quoted?.participant ||
      quoted?.mentionedJid?.[0]

    if (!target && args[0]) {
      const num = args[0].replace(/[^0-9]/g, '')
      if (num.length >= 10) target = num + '@s.whatsapp.net'
    }

    if (!target) {
      return reply('❗ Marque ou responda a mensagem de um usuário.\nEx: .ban @usuario')
    }

    const botNumber = client.user?.id?.split(':')[0]
    if (target.includes(botNumber)) return reply('❌ Eu não posso me banir!')
    if (target === sender) return reply('❌ Você não pode se banir!')

    try {
      await client.groupParticipantsUpdate(from, [target], 'remove')
      await client.sendMessage(
        from,
        { text: `✅ @${target.split('@')[0]} foi removido do grupo.`, mentions: [target] },
        { quoted: info }
      )
    } catch (error) {
      console.error('[ban]', error)
      reply(`❌ Erro ao banir: ${error.message}`)
    }
  }
}
