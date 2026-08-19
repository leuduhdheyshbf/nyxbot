module.exports = {
  name: 'socar',
  description: 'socou alguém (menção/reply)',
  category: 'resenha',
  aliases: ["soco"],
  async execute({ client, from, info, args, reply, sender, reagir }) {
    await reagir('👊')
    const quoted = info.message?.extendedTextMessage?.contextInfo
    let target = quoted?.participant || quoted?.mentionedJid?.[0]
    if (!target && args[0]) {
      const n = args[0].replace(/\D/g, '')
      if (n.length >= 10) target = n + '@s.whatsapp.net'
    }
    if (!target) return reply('❗ Marque alguém ou responda a mensagem.\nEx: .socar @fulano')
    const frases = ["socou com força total","socou de um jeito épico","socou e o grupo inteiro viu","socou no estilo gótico 🦇","socou e ainda sorriu"]
    const f = frases[Math.floor(Math.random() * frases.length)]
    const a = '@' + String(sender).split('@')[0]
    const b = '@' + String(target).split('@')[0]
    await client.sendMessage(from, {
      text: `👊 ${a} ${f} em ${b}!`,
      mentions: [sender, target]
    }, { quoted: info })
  }
}
