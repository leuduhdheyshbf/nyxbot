const { listBlacklist } = require('../../utils/blacklist')

module.exports = {
  name: 'blacklist',
  description: 'Mostra a lista negra permanente do grupo',
  category: 'admin',
  aliases: ['listaban', 'listanegra'],

  async execute({ from, reply, isGroup, isAdmin, isAdm, isDono }) {
    const adm = isAdmin || isAdm || isDono
    if (!isGroup) return reply('❌ Este comando só pode ser usado em grupos!')
    if (!adm) return reply('❌ Apenas administradores podem usar este comando!')

    const list = await listBlacklist(from)
    if (!list.length) return reply('📋 A lista negra deste grupo está vazia.')

    const lines = list.map((row, i) => {
      const number = String(row.user_jid || '').split('@')[0].split(':')[0]
      const reason = row.reason ? ` — ${row.reason}` : ''
      return `${i + 1}. 📱 ${number}${reason}`
    })

    return reply(
      `🚫 *LISTA NEGRA — PERMANENTE*\n\n${lines.join('\n')}\n\n` +
      `☁️ Salva no Supabase.\n` +
      `📌 O número pode ser adicionado mesmo fora do grupo e será bloqueado quando tentar entrar.`
    )
  }
}
