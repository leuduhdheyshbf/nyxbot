module.exports = {
  name: 'inesquecivel',
  description: 'Medidor inesquecível (brincadeira)',
  category: 'resenha',
  aliases: ["inesquecivelmetro"],
  async execute({ client, from, info, reply, reagir, args, sender }) {
    await reagir('🔥')
    const quoted = info.message?.extendedTextMessage?.contextInfo
    let target = quoted?.participant || quoted?.mentionedJid?.[0] || sender
    if (args[0] && !quoted) {
      const n = args[0].replace(/\D/g, '')
      if (n.length >= 10) target = n + '@s.whatsapp.net'
    }
    const pct = Math.floor(Math.random() * 101)
    const tag = '@' + String(target).split('@')[0]
    await client.sendMessage(from, {
      text: `🔥 ${tag} é *${pct}%* inesquecível`,
      mentions: [target]
    }, { quoted: info })
  }
}
