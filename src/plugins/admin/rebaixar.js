module.exports = {
  name: 'rebaixar',
  description: 'Rebaixa um administrador a membro',
  category: 'admin',
  aliases: ['demote', 'despromover'],

  async execute({ client, from, info, args, reply, isGroup, isAdmin, isAdm, isBotAdmin, isBotAdm, sender }) {
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

    if (!target) return reply('❗ Marque ou responda a mensagem de um usuário.\nEx: .rebaixar @usuario')
    if (target === sender) return reply('❌ Você não pode se rebaixar!')

    try {
      const meta = await client.groupMetadata(from)
      const member = meta.participants.find(p => p.id === target)
      if (!member) return reply('❌ Este usuário não está no grupo!')
      if (member.admin !== 'admin' && member.admin !== 'superadmin') {
        return reply('❌ Este usuário não é administrador!')
      }

      await client.groupParticipantsUpdate(from, [target], 'demote')
      await client.sendMessage(
        from,
        { text: `✅ @${target.split('@')[0]} foi rebaixado a membro comum!`, mentions: [target] },
        { quoted: info }
      )
    } catch (error) {
      console.error('[rebaixar]', error)
      reply(`❌ Erro ao rebaixar: ${error.message}`)
    }
  }
}
