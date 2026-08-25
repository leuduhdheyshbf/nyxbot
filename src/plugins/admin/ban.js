const { addBlacklist, normalizeJid } = require('../../utils/blacklist')

module.exports = {
  name: 'ban',
  description: 'Bane e coloca o número na lista negra permanente do grupo',
  category: 'admin',
  aliases: ['kick', 'expulsar'],

  async execute({ client, from, info, args, reply, isGroup, isAdmin, isAdm, isBotAdmin, isBotAdm, sender }) {
    const adm = isAdmin || isAdm
    const botAdm = isBotAdmin || isBotAdm

    if (!isGroup) return reply('❌ Este comando só pode ser usado em grupos!')
    if (!adm) return reply('❌ Apenas administradores podem usar este comando!')
    if (!botAdm) return reply('❌ O bot precisa ser administrador do grupo!')

    const quoted = info.message?.extendedTextMessage?.contextInfo
    let target = quoted?.participant || quoted?.mentionedJid?.[0]
    if (!target && args[0]) target = normalizeJid(args[0])
    target = normalizeJid(target)

    if (!target) {
      return reply(
        '❗ Informe, marque ou responda ao usuário.\n\n' +
        'Exemplos:\n• .ban @usuario\n• .ban 5511999999999\n• Responda à mensagem e use .ban\n\n' +
        '📱 O número será salvo permanentemente no Supabase deste grupo, mesmo que a pessoa não esteja no grupo.'
      )
    }

    const botNumber = client.user?.id?.split(':')[0]
    if (botNumber && target.split('@')[0] === botNumber) return reply('❌ Eu não posso me banir!')
    if (target === sender) return reply('❌ Você não pode se banir!')

    const saved = await addBlacklist(from, target, sender)
    if (!saved) {
      return reply('❌ Não consegui salvar o usuário na lista negra do Supabase. O banimento não foi aplicado.')
    }

    try {
      await client.groupParticipantsUpdate(from, [target], 'remove')
      await client.sendMessage(
        from,
        {
          text: `🚫 @${target.split('@')[0]} foi colocado na lista negra permanente deste grupo e removido.\n\n🛑 Se tentar entrar novamente, será removido automaticamente.`,
          mentions: [target]
        },
        { quoted: info }
      )
    } catch (error) {
      // A blacklist já foi salva. Isso também funciona para números que não estão no grupo.
      await reply(
        `✅ @${target.split('@')[0]} foi salvo na lista negra permanente deste grupo.\n\n` +
        `ℹ️ O número pode não estar atualmente no grupo, então não houve remoção agora.\n` +
        `🛑 Se tentar entrar futuramente, o bot tentará removê-lo automaticamente.`
      ).catch(() => {})
    }
  }
}
