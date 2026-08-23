module.exports = {
  name: 'casal18',
  description: 'Ship +18 aleatório',
  category: 'adulto',
  aliases: ['ship18'],
  async execute({ reply, info, q }) {
    const mencoes = info.message?.extendedTextMessage?.contextInfo?.mentionedJid || []
    let a, b
    if (mencoes.length >= 2) {
      a = `@${mencoes[0].split('@')[0]}`
      b = `@${mencoes[1].split('@')[0]}`
    } else {
      const nomes = (q || '').split(/\s+/).filter(Boolean)
      a = nomes[0] || 'Pessoa A'
      b = nomes[1] || 'Pessoa B'
    }
    const pct = Math.floor(Math.random() * 101)
    const frases = [
      'Só amizade... por enquanto',
      'Tem química',
      'Quente demais',
      'Casal do crime',
      'Melhor não misturar'
    ]
    const frase = frases[Math.floor(Math.random() * frases.length)]
    await reply(`🔥 *Ship +18*\n${a} 💕 ${b}\nCompatibilidade: *${pct}%*\n_${frase}_`)
  }
}
