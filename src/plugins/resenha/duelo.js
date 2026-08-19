module.exports = {
  name: 'duelo',
  description: 'Duelo entre duas pessoas',
  category: 'resenha',
  aliases: ['versus', 'vs'],
  async execute({ client, from, info, args, reply, reagir, sender }) {
    await reagir('⚔️')
    const quoted = info.message?.extendedTextMessage?.contextInfo
    let p1 = sender
    let p2 = quoted?.participant || quoted?.mentionedJid?.[0]
    if (!p2 && args[0]) {
      const n = args[0].replace(/\D/g, '')
      if (n.length >= 10) p2 = n + '@s.whatsapp.net'
    }
    if (!p2) return reply('❗ Marque o oponente.\nEx: .duelo @fulano')
    const score1 = Math.floor(Math.random() * 100)
    const score2 = Math.floor(Math.random() * 100)
    const win = score1 >= score2 ? p1 : p2
    await client.sendMessage(from, {
      text: `⚔️ *DUELO*\n@${p1.split('@')[0]} (${score1}) vs @${p2.split('@')[0]} (${score2})\n🏆 Vencedor: @${win.split('@')[0]}`,
      mentions: [p1, p2, win]
    }, { quoted: info })
  }
}
