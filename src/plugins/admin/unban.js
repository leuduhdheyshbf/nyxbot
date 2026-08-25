const { removeBlacklist, normalizeJid } = require('../../utils/blacklist')

module.exports = {
  name: 'unban',
  description: 'Remove um usuário da lista negra do grupo',
  category: 'admin',
  aliases: ['desban', 'desbanir'],

  async execute({ from, info, args, reply, isGroup, isAdmin, isAdm, isDono }) {
    const adm = isAdmin || isAdm || isDono
    if (!isGroup) return reply('❌ Este comando só pode ser usado em grupos!')
    if (!adm) return reply('❌ Apenas administradores podem usar este comando!')

    const quoted = info.message?.extendedTextMessage?.contextInfo
    let target = quoted?.participant || quoted?.mentionedJid?.[0]
    if (!target && args[0]) target = normalizeJid(args[0])
    target = normalizeJid(target)

    if (!target) return reply('❗ Marque, responda ou informe o número do usuário.\nEx: .unban 5511999999999')

    const removed = await removeBlacklist(from, target)
    return reply(
      removed
        ? `✅ @${target.split('@')[0]} foi removido da lista negra deste grupo.`
        : `ℹ️ @${target.split('@')[0]} não estava na lista negra deste grupo.`
    )
  }
}
