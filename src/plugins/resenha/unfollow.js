module.exports = {
  name: 'unfollow',
  description: 'deixou de seguir alguém (menção/reply)',
  category: 'resenha',
  aliases: [],
  async execute({ client, from, info, args, reply, sender, reagir }) {
    await reagir('➖')
    const quoted = info.message?.extendedTextMessage?.contextInfo
    let target = quoted?.participant || quoted?.mentionedJid?.[0]
    if (!target && args[0]) {
      const n = args[0].replace(/\D/g, '')
      if (n.length >= 10) target = n + '@s.whatsapp.net'
    }
    if (!target) return reply('❗ Marque alguém ou responda a mensagem.\nEx: .unfollow @fulano')
    const frases = ["deixou de seguir com força total","deixou de seguir de um jeito épico","deixou de seguir e o grupo inteiro viu","deixou de seguir no estilo gótico 🦇","deixou de seguir e ainda sorriu"]
    const f = frases[Math.floor(Math.random() * frases.length)]
    const a = '@' + String(sender).split('@')[0]
    const b = '@' + String(target).split('@')[0]
    await client.sendMessage(from, {
      text: `➖ ${a} ${f} em ${b}!`,
      mentions: [sender, target]
    }, { quoted: info })
  }
}
