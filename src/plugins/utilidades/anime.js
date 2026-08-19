const axios = require('axios')
module.exports = {
  name: 'anime',
  description: 'Busca anime no MyAnimeList',
  category: 'utilidades',
  aliases: ['mal'],
  async execute({ nyx, from, info, reply, reagir, q }) {
    if (!q) return reply('❗ Use: .anime nome do anime')
    try {
      await reagir('🔎')
      const { data } = await axios.get('https://api.jikan.moe/v4/anime', {
        params: { q: q, limit: 1 }, timeout: 12000
      })
      const a = data?.data?.[0]
      if (!a) return reply('❌ Anime não encontrado.')
      const syn = (a.synopsis || 'Sem sinopse.').slice(0, 400)
      const caption =
`📺 *${a.title}*
⭐ Score: ${a.score || 'N/A'}
🎬 Episódios: ${a.episodes || '?'}
📅 ${a.year || a.aired?.from?.slice(0, 4) || '?'}
📌 ${a.status || ''}
🏷️ ${(a.genres || []).map(g => g.name).slice(0, 5).join(', ') || '—'}

${syn}...

🔗 ${a.url || ''}`
      if (a.images?.jpg?.large_image_url || a.images?.jpg?.image_url) {
        await nyx.sendMessage(from, {
          image: { url: a.images.jpg.large_image_url || a.images.jpg.image_url },
          caption
        }, { quoted: info })
      } else reply(caption)
      await reagir('✅')
    } catch (e) {
      console.error(e); reply('❌ Erro na API Jikan. Tente de novo.')
    }
  }
}
