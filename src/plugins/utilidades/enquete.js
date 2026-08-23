module.exports = {
  name: 'enquete',
  description: 'Cria uma enquete',
  category: 'utilidades',
  aliases: ['poll', 'votacao'],
  async execute({ nyx, from, reply, reagir, q, isGroup }) {
    if (!q) return reply('❗ Use: .enquete Pergunta | opção1 | opção2 | opção3')
    const parts = q.split('|').map(s => s.trim()).filter(Boolean)
    if (parts.length < 3) return reply('❗ Precisa de pergunta + pelo menos 2 opções.\nEx: .enquete Qual melhor? | A | B | C')
    try {
      await reagir('📊')
      const name = parts[0]
      const values = parts.slice(1).slice(0, 12)
      await nyx.sendMessage(from, {
        poll: { name, values, selectableCount: 1 }
      })
      await reagir('✅')
    } catch (e) {
      console.error(e)
      reply('❌ Erro ao criar enquete.')
    }
  }
}
