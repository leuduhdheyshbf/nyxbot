const axios = require('axios')

module.exports = {
  name: 'instagram',
  description: 'Baixa foto/vídeo do Instagram',
  category: 'downloads',
  aliases: ['ig', 'insta', 'igdl'],
  async execute({ nyx, from, info, reply, reagir, q }) {
    if (!q || (!q.includes('instagram.com') && !q.includes('instagr.am'))) {
      return reply('❗ Envie o link do Instagram.\nEx: !ig https://www.instagram.com/p/...')
    }

    try {
      await reagir('⬇️')
      reply('⬇️ Baixando Instagram...')

      // Várias APIs fallback
      const apis = [
        `https://api.agungdev.my.id/api/instagram?url=${encodeURIComponent(q)}`,
        `https://instagram-downloader-download-instagram-videos-stories1.p.rapidapi.com/`
      ]

      // Tentativa com endpoint simples
      let mediaList = []
      try {
        const { data } = await axios.get(`https://igram.site/api/ig?url=${encodeURIComponent(q)}`, { timeout: 15000 })
        if (data?.result) mediaList = Array.isArray(data.result) ? data.result : [data.result]
      } catch {}

      if (!mediaList.length) {
        try {
          const { data } = await axios.get(`https://api.lolhuman.xyz/api/instagram?apikey=GataDios&url=${encodeURIComponent(q)}`, { timeout: 15000 })
          if (data?.result) mediaList = Array.isArray(data.result) ? data.result : [data.result]
        } catch {}
      }

      if (!mediaList.length) {
        return reply('❌ Não consegui baixar. O post pode ser privado ou a API está offline.\n\nTente outro link ou use o app oficial.')
      }

      for (const item of mediaList.slice(0, 5)) {
        const url = item.url || item
        if (!url) continue
        const isVideo = (item.type === 'video') || url.includes('.mp4')
        if (isVideo) {
          await nyx.sendMessage(from, { video: { url }, caption: '✅ Instagram' }, { quoted: info })
        } else {
          await nyx.sendMessage(from, { image: { url }, caption: '✅ Instagram' }, { quoted: info })
        }
      }

      await reagir('✅')
    } catch (e) {
      console.error(e)
      await reagir('❌')
      reply('❌ Erro ao baixar o Instagram.')
    }
  }
}
