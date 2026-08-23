const axios = require('axios')

module.exports = {
  name: 'pinterest',
  description: 'Busca imagens no Pinterest',
  category: 'downloads',
  aliases: ['pin', 'pint'],
  async execute({ nyx, from, info, reply, reagir, q }) {
    if (!q) return reply('❗ Use: .pinterest gato fofo')
    try {
      await reagir('🔎')
      // API pública simples
      const { data } = await axios.get(`https://api.lolhuman.xyz/api/pinterest?apikey=GataDios&query=${encodeURIComponent(q)}`, { timeout: 15000 })
      const urls = data?.result
      if (!urls || !urls.length) {
        // fallback
        return reply('❌ Não encontrei imagens. Tente outro termo.')
      }
      const pick = urls.slice(0, 3)
      for (const url of pick) {
        await nyx.sendMessage(from, { image: { url }, caption: `📌 ${q}` }, { quoted: info })
      }
      await reagir('✅')
    } catch {
      await reagir('❌')
      reply('❌ Erro na busca do Pinterest.')
    }
  }
}
