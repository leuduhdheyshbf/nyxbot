module.exports = {
  name: 'slot',
  description: 'Caça-níquel emoji',
  category: 'jogos',
  aliases: ['slots'],
  async execute({ reply, reagir }) {
    await reagir('🎰')
    const sym = ['🍒', '🍋', '🔔', '⭐', '7️⃣', '💎']
    const a = sym[Math.floor(Math.random() * sym.length)]
    const b = sym[Math.floor(Math.random() * sym.length)]
    const c = sym[Math.floor(Math.random() * sym.length)]
    let msg = `🎰 | ${a} | ${b} | ${c} |\n`
    if (a === b && b === c) msg += '🏆 JACKPOT!'
    else if (a === b || b === c || a === c) msg += '✨ Quase!'
    else msg += '💀 Tente de novo'
    await reply(msg)
  }
}
