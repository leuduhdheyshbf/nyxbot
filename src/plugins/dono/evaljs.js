module.exports = {
  name: 'evaljs',
  description: 'Eval JS restrito (dono) — use com cuidado',
  category: 'dono',
  aliases: ['eval'],
  dono: true,
  async execute({ reply, q, isDono }) {
    if (!isDono) return reply('🔒 Só o dono.')
    if (!q) return reply('❗ Use: .evaljs 1+1')
    try {
      const result = Function('"use strict"; return (' + q + ')')()
      await reply('✅ ' + String(result).slice(0, 2000))
    } catch (e) {
      await reply('❌ ' + e.message)
    }
  }
}
