const axios = require('axios')
module.exports = {
  name: 'traduzir',
  description: 'Traduz texto',
  category: 'utilidades',
  aliases: ['traduz', 'tr'],
  async execute({ reply, reagir, q }) {
    if (!q) return reply('❗ Use: .traduzir en|texto  ou  .traduzir texto')
    try {
      await reagir('🌐')
      let dest = 'en', text = q
      const m = q.match(/^([a-z]{2})\|(.+)$/i)
      if (m) { dest = m[1].toLowerCase(); text = m[2].trim() }
      const url = `https://api.mymemory.translated.net/get?q=${encodeURIComponent(text)}&langpair=pt|${dest}`
      const { data } = await axios.get(url, { timeout: 12000 })
      const out = data?.responseData?.translatedText
      if (!out) return reply('❌ Falha na tradução.')
      reply(`🌐 *Tradução (${dest}):*\n${out}`)
    } catch { reply('❌ Erro ao traduzir.') }
  }
}
