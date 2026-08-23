const axios = require('axios')

module.exports = {
  name: 'tiktok',
  description: 'Baixa vídeo do TikTok sem marca d\'água',
  category: 'downloads',
  aliases: ['tt', 'tiktokdl'],
  async execute({ nyx, from, info, reply, reagir, q }) {
    if (!q || (!q.includes('tiktok.com') && !q.includes('vm.tiktok.com'))) {
      return reply('❗ Envie o link do TikTok.\nEx: !tiktok https://vm.tiktok.com/...')
    }

    try {
      await reagir('⬇️')
      reply('⬇️ Baixando TikTok...')

      // API pública simples (pode falhar se cair)
      const apis = [
        `https://tikwm.com/api/?url=${encodeURIComponent(q)}`,
        `https://api.tiklydown.eu.org/api/download?url=${encodeURIComponent(q)}`
      ]

      let videoUrl = null
      let title = 'TikTok'

      for (const api of apis) {
        try {
          const { data } = await axios.get(api, { timeout: 15000 })
          if (data?.data?.play) {
            videoUrl = data.data.play
            title = data.data.title || title
            break
          }
          if (data?.video?.noWatermark) {
            videoUrl = data.video.noWatermark
            title = data.title || title
            break
          }
        } catch {}
      }

      if (!videoUrl) return reply('❌ Não consegui baixar esse TikTok. Tente outro link.')

      await nyx.sendMessage(from, {
        video: { url: videoUrl },
        caption: `✅ TikTok baixado!\n📝 ${title.slice(0, 100)}`
      }, { quoted: info })

      await reagir('✅')
    } catch (e) {
      console.error(e)
      await reagir('❌')
      reply('❌ Erro ao baixar o TikTok.')
    }
  }
}
