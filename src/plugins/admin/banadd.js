const { addBlacklist, normalizeJid } = require('../../utils/blacklist')

module.exports = {
  name: 'banadd',
  description: 'Adiciona um número à lista negra sem precisar que ele esteja no grupo',
  category: 'admin',
  aliases: ['addban', 'blackban', 'banlistadd'],

  async execute({ from, args, reply, isGroup, isAdmin, isAdm, isDono, sender }) {
    const adm = isAdmin || isAdm || isDono
    if (!isGroup) return reply('❌ Este comando só pode ser usado em grupos!')
    if (!adm) return reply('❌ Apenas administradores podem usar este comando!')

    const raw = args?.[0]
    const target = normalizeJid(raw)
    if (!target || !target.endsWith('@s.whatsapp.net')) {
      return reply(
        '❗ Informe o número com DDI, sem +, espaços ou símbolos.\n\n' +
        'Exemplo:\n• .banadd 5511999999999\n\n' +
        '👤 A pessoa não precisa estar no grupo e nunca precisa ter entrado nele.'
      )
    }

    const botNumber = String(sender || '').split('@')[0].split(':')[0]
    if (botNumber && target.split('@')[0] === botNumber) return reply('❌ Eu não posso adicionar meu próprio número à lista negra!')

    const saved = await addBlacklist(from, target, sender, 'Adicionado manualmente pelo comando .banadd')
    if (!saved) {
      return reply('❌ Não consegui salvar o número na lista negra do Supabase.')
    }

    return reply(
      `🚫 +${target.split('@')[0]} foi adicionado à lista negra permanente deste grupo.\n\n` +
      `👤 A pessoa não precisa estar no grupo.\n` +
      `🛑 Se tentar entrar futuramente, o bot tentará removê-la automaticamente.\n` +
      `☁️ Registro salvo no Supabase.`
    )
  }
}
