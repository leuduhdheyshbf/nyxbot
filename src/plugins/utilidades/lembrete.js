const timers = new Map()

module.exports = {
  name: 'lembrete',
  description: 'Cria um lembrete (em minutos)',
  category: 'utilidades',
  aliases: ['lembrar', 'remind'],
  async execute({ nyx, from, info, reply, reagir, args, q, sender }) {
    // .lembrete 5 tomar agua
    const min = parseInt(args[0])
    if (!min || min < 1 || min > 1440) return reply('❗ Use: .lembrete 5 texto\n(minutos entre 1 e 1440)')
    const texto = args.slice(1).join(' ')
    if (!texto) return reply('❗ Coloque o texto do lembrete.')

    await reagir('⏰')
    reply(`⏰ Lembrete marcado para daqui *${min} min*:\n_${texto}_`)

    const key = `${from}_${sender}_${Date.now()}`
    const t = setTimeout(async () => {
      try {
        await nyx.sendMessage(from, {
          text: `⏰ *Lembrete!*\n\n@${sender.split('@')[0]}\n📌 ${texto}`,
          mentions: [sender]
        })
      } catch {}
      timers.delete(key)
    }, min * 60 * 1000)
    timers.set(key, t)
  }
}
