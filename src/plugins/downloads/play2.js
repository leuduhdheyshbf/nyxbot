const yts = require('yt-search')
module.exports = {
  name: 'play2',
  description: 'Busca música no YouTube (só info/link)',
  category: 'downloads',
  aliases: ['ytsearch'],
  async execute({ reply, reagir, q }) {
    if (!q) return reply('❗ Use: .play2 nome da música')
    await reagir('🔎')
    try {
      const r = await yts(q)
      const v = r.videos?.[0]
      if (!v) return reply('❌ Nada encontrado.')
      await reply(`🎵 *${v.title}*\n⏱️ ${v.timestamp}\n👁️ ${v.views}\n🔗 ${v.url}`)
    } catch (e) {
      await reply('❌ ' + e.message)
    }
  }
}
