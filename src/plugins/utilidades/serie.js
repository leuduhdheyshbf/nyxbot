const axios = require('axios')
module.exports = {
  name: 'serie',
  description: 'Busca série de TV',
  category: 'utilidades',
  aliases: ['tv', 'show'],
  async execute({ nyx, from, info, reply, reagir, q }) {
    if (!q) return reply('❗ Use: .serie nome da série')
    try {
      await reagir('🔎')
      const { data } = await axios.get('https://api.tvmaze.com/search/shows', {
        params: { q }, timeout: 12000
      })
      const item = data?.[0]?.show
      if (!item) return reply('❌ Série não encontrada.')
      const summary = (item.summary || 'Sem sinopse.').replace(/<[^>]+>/g, '').slice(0, 400)
      const caption =
`📺 *${item.name}*
⭐ ${item.rating?.average || 'N/A'}
📌 ${item.status || ''} · ${item.premiered || '?'}
🏷️ ${(item.genres || []).join(', ') || '—'}
🌐 ${item.language || ''}

${summary}`
      if (item.image?.medium || item.image?.original) {
        await nyx.sendMessage(from, {
          image: { url: item.image.original || item.image.medium },
          caption
        }, { quoted: info })
      } else reply(caption)
    } catch (e) {
      console.error(e); reply('❌ Erro ao buscar série.')
    }
  }
}
