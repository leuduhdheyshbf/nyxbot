'use strict'
module.exports = {
  name: 'checklist',
  description: 'Monta checklist',
  category: 'trabalho',
  aliases: ['todo', 'tarefas'],
  cooldown: 3,
  async execute({ reply, reagir, args, prefix }) {
    await reagir('✅')
    const p = prefix || '.'
    const raw = (args || []).join(' ').trim()
    if (!raw) return reply(`✅ Uso: *${p}checklist pão, estudar, treinar*`)
    const items = raw.split(/[,;|]/).map(s => s.trim()).filter(Boolean).slice(0, 20)
    let text = '✅ *Checklist*\n\n'
    items.forEach((it, i) => { text += `☐ ${i + 1}. ${it}\n` })
    await reply(text)
  }
}
