module.exports = {
  name: 'bencao',
  description: 'abençoou alguém (menção/reply)',
  category: 'resenha',
  aliases: ["abencoar"],
  async execute({ client, from, info, args, reply, sender, reagir }) {
    await reagir('🙏')
    const quoted = info.message?.extendedTextMessage?.contextInfo
    let target = quoted?.participant || quoted?.mentionedJid?.[0]
    if (!target && args[0]) {
      const n = args[0].replace(/\D/g, '')
      if (n.length >= 10) target = n + '@s.whatsapp.net'
    }
    if (!target) return reply('❗ Marque alguém ou responda a mensagem.\nEx: .bencao @fulano')
    const frases = ["abençoou com força total","abençoou de um jeito épico","abençoou e o grupo inteiro viu","abençoou no estilo gótico 🦇","abençoou e ainda sorriu"]
    const f = frases[Math.floor(Math.random() * frases.length)]
    const a = '@' + String(sender).split('@')[0]
    const b = '@' + String(target).split('@')[0]
    await client.sendMessage(from, {
      text: `🙏 ${a} ${f} em ${b}!`,
      mentions: [sender, target]
    }, { quoted: info })
  }
}
