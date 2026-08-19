const yts = require('yt-search')
const { exec } = require('child_process')
const fs = require('fs')
const path = require('path')
const { tmpdir } = require('os')
const Crypto = require('crypto')

module.exports = {
  name: 'ytmp4',
  description: 'Baixa vídeo do YouTube',
  category: 'downloads',
  aliases: ['yt', 'youtube', 'video'],
  async execute({ nyx, from, info, reply, reagir, q }) {
    if (!q) return reply('❗ Use: .ytmp4 nome ou link do vídeo')
    try {
      await reagir('🔎')
      let video
      if (q.includes('youtube.com') || q.includes('youtu.be')) {
        const id = q.split('v=')[1]?.split('&')[0] || q.split('/').pop()
        const r = await yts({ videoId: id })
        video = r.videos?.[0] || r
      } else {
        const r = await yts(q)
        video = r.videos?.[0]
      }
      if (!video) return reply('❌ Nada encontrado.')

      await reagir('⬇️')
      reply(`⬇️ Baixando:\n*${video.title}*`)
      const outFile = path.join(tmpdir(), `${Crypto.randomBytes(6).toString('hex')}.mp4`)

      await new Promise((resolve, reject) => {
        exec(`yt-dlp -f "bv*[height<=480]+ba/b[height<=480]" --merge-output-format mp4 -o "${outFile}" "${video.url}"`, (err) => err ? reject(err) : resolve())
      })

      if (!fs.existsSync(outFile)) return reply('❌ Erro no download. Instale yt-dlp no sistema.')

      const size = fs.statSync(outFile).size
      if (size > 50 * 1024 * 1024) {
        fs.unlinkSync(outFile)
        return reply('❌ Vídeo muito grande (máx 50MB).')
      }

      await nyx.sendMessage(from, {
        video: fs.readFileSync(outFile),
        caption: `🎬 ${video.title}\n⏱️ ${video.timestamp || ''}`
      }, { quoted: info })
      try { fs.unlinkSync(outFile) } catch {}
      await reagir('✅')
    } catch (e) {
      console.error(e)
      await reagir('❌')
      reply('❌ Erro ao baixar o vídeo.')
    }
  }
}
