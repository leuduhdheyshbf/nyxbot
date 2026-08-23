'use strict'
module.exports = {
  name: 'pomodoro',
  description: 'Timer pomodoro (texto)',
  category: 'trabalho',
  aliases: ['pomodoro25', 'foco25'],
  cooldown: 5,
  async execute({ reply, reagir, args, prefix }) {
    await reagir('🍅')
    const min = Math.min(60, Math.max(1, parseInt(args[0], 10) || 25))
    const p = prefix || '.'
    await reply(`🍅 *Pomodoro — ${min} min*\n\nFoco total agora.\nPause 5 min depois.\n\nOutro: *${p}pomodoro 15*`)
  }
}
