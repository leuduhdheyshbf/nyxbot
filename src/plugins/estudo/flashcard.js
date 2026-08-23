'use strict'
module.exports = {
  name: 'flashcard',
  description: 'Flashcard pergunta | resposta',
  category: 'estudo',
  aliases: ['fc'],
  cooldown: 3,
  async execute({ reply, reagir, args, prefix }) {
    await reagir('🃏')
    const p = prefix || '.'
    const raw = (args || []).join(' ')
    if (!raw.includes('|')) return reply(`🃏 Uso: *${p}flashcard Capital | Tóquio*`)
    const [q, a] = raw.split('|').map(s => s.trim())
    await reply(`🃏 *Flashcard*\n\n❓ ${q}\n💡 ${a}`)
  }
}
