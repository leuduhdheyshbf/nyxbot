module.exports = {
  name: 'gostosa',
  description: 'Porcentagem aleatória de gostosa',
  category: 'adulto',
  aliases: [],
  async execute({ reply, info, q }) {
    const menc = info.message?.extendedTextMessage?.contextInfo?.mentionedJid?.[0]
    const nome = menc ? `@${menc.split('@')[0]}` : (q || 'Essa pessoa')
    const pct = Math.floor(Math.random() * 101)
    let txt = ''
    if (pct < 20) txt = '😅 Fraco...'
    else if (pct < 50) txt = '😏 Até que vai'
    else if (pct < 80) txt = '🔥 Tá ótimo'
    else txt = '🥵 DESTRUIÇÃO TOTAL'
    await reply(`🔞 *Nível Gostosa*\n${nome}: *${pct}%*\n${txt}`)
  }
}
