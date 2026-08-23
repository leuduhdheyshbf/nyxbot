const axios = require('axios')

const SUBS = [
  'memesbrasil',
  'botecodoreddit',
  'DiretoDoZapZap',
  'eu_nvr',
  'MemesBR',
  'ShitpostBrasil'
]

module.exports = {
  name: 'meme',
  description: 'Envia um meme aleatório (PT-BR)',
  category: 'cmds-aleatorios',
  aliases: ['memes', 'memebr'],
  async execute({ nyx, from, info, reply, reagir }) {
    try {
      await reagir('😂')

      const shuffled = [...SUBS].sort(() => Math.random() - 0.5)
      let post = null

      for (const sub of shuffled) {
        try {
          const { data } = await axios.get(`https://meme-api.com/gimme/${sub}`, { timeout: 10000 })
          if (data?.url && (data.nsfw === false || data.nsfw === undefined)) {
            post = data
            break
          }
        } catch {}
      }

      if (!post) {
        try {
          const { data } = await axios.get('https://meme-api.com/gimme', { timeout: 10000 })
          post = data
        } catch {}
      }

      if (!post) {
        try {
          const sub = shuffled[0]
          const { data } = await axios.get(
            `https://www.reddit.com/r/${sub}/hot.json?limit=30`,
            { timeout: 12000, headers: { 'User-Agent': 'NyxBot/1.0' } }
          )
          const posts = (data?.data?.children || [])
            .map(c => c.data)
            .filter(p => p && !p.over_18 && (p.url?.match(/\.(jpg|jpeg|png|gif|webp)$/i) || p.post_hint === 'image'))
          if (posts.length) {
            const p = posts[Math.floor(Math.random() * posts.length)]
            post = { title: p.title, url: p.url, subreddit: sub }
          }
        } catch {}
      }

      if (!post?.url) {
        return reply('❌ Não achei meme agora. Tenta de novo em instantes.')
      }

      await nyx.sendMessage(from, {
        image: { url: post.url },
        caption: `😂 *${post.title || 'Meme'}*\n📌 r/${post.subreddit || 'memes'}`
      }, { quoted: info })
    } catch (e) {
      console.error('[meme]', e)
      reply('❌ Erro ao buscar meme.')
    }
  }
}
