module.exports = {
  name: 'pau',
  description: 'Tamanho aleatório (zoação)',
  category: 'adulto',
  aliases: ['pinto', 'toco'],
  async execute({ reply, info, q }) {
    const menc = info.message?.extendedTextMessage?.contextInfo?.mentionedJid?.[0]
    const nome = menc ? `@${menc.split('@')[0]}` : (q || 'Fulano')
    const cm = (Math.random() * 30 + 1).toFixed(1)
    const bar = '█'.repeat(Math.min(20, Math.floor(cm / 1.5))) + '░'.repeat(Math.max(0, 20 - Math.floor(cm / 1.5)))
    await reply(`🍌 *Medidor*\n${nome}\n${bar}\n📏 *${cm} cm*`)
  }
}
