const axios = require('axios')

const TIPOS = {
  waifu: 'waifu',
  neko: 'neko',
  blowjob: 'blowjob',
  trap: 'trap',
  ahegao: 'neko'
}

module.exports = {
  name: 'nsfw',
  description: 'Imagem NSFW aleatória',
  category: 'adulto',
  aliases: ['hentai', 'nudes'],
  async execute({ nyx, from, info, reply, reagir, q, command }) {
    try {
      await reagir('🔥')
      let tipo = (q || '').toLowerCase().trim().split(/\s+/)[0]

      // .hentai = random
      if (command === 'hentai' || command === 'nudes') tipo = tipo || 'waifu'

      const endpoints = []
      if (tipo && TIPOS[tipo]) {
        endpoints.push(`https://api.waifu.pics/nsfw/${TIPOS[tipo]}`)
      } else {
        // random entre tipos
        endpoints.push('https://api.waifu.pics/nsfw/waifu')
        endpoints.push('https://api.waifu.pics/nsfw/neko')
        endpoints.push('https://api.waifu.pics/nsfw/blowjob')
        endpoints.push('https://api.waifu.pics/nsfw/trap')
      }

      const urlApi = endpoints[Math.floor(Math.random() * endpoints.length)]
      const { data } = await axios.get(urlApi, { timeout: 12000 })
      if (!data?.url) return reply('❌ Não consegui buscar imagem agora.')

      await nyx.sendMessage(from, {
        image: { url: data.url },
        caption: `🔞 NSFW · Nyx Bot\n📌 Use: .nsfw waifu|neko|blowjob|trap`
      }, { quoted: info })
      await reagir('✅')
    } catch (e) {
      console.error('[nsfw]', e?.message || e)
      await reagir('❌')
      reply('❌ API NSFW offline ou bloqueada. Tente de novo.')
    }
  }
}
