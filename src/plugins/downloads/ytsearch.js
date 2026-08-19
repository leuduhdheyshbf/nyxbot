const yts = require('yt-search')
module.exports = {
  name: 'ytsearch',
  description: 'Lista 5 resultados do YouTube',
  category: 'downloads',
  aliases: ['yts'],
  async execute({ reply, reagir, q }) {
    if (!q) return reply('❗ Use: .ytsearch termo')
    await reagir('🔎')
    try {
      const r = await yts(q)
      const list = (r.videos || []).slice(0, 5)
      if (!list.length) return reply('❌ Nada encontrado.')
      let txt = '🔎 *Resultados*\n\n'
      list.forEach((v, i) => { txt += `${i + 1}. ${v.title}\n${v.url}\n\n` })
      await reply(txt)
    } catch (e) {
      await reply('❌ ' + e.message)
    }
  }
}
