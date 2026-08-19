const yts = require('yt-search')
const { exec } = require('child_process')
const fs = require('fs')
const path = require('path')
const { tmpdir } = require('os')
const crypto = require('crypto')

module.exports = {
  name: 'play',
  description: 'Baixa áudio do YouTube',
  category: 'downloads',
  aliases: ['ytmp3', 'musica', 'song'],

  async execute({ client, from, info, args, prefix, reply }) {
    const q = args.join(' ').trim()

    if (!q) {
      return reply(`❗ Digite o nome ou link da música.\nEx: ${prefix || '!'}play nome da musica`)
    }

    try {
      await reply('🔎 Procurando...')

      let video

      if (q.includes('youtube.com') || q.includes('youtu.be')) {
        let videoId = null
        if (q.includes('v=')) {
          videoId = q.split('v=')[1]?.split('&')[0]
        } else {
          videoId = q.split('/').pop()?.split('?')[0]
        }

        if (videoId) {
          const r = await yts({ videoId })
          video = r.videos?.[0] || (r.title ? r : null)
        }
      } else {
        const r = await yts(q)
        video = r.videos?.[0]
      }

      if (!video || !video.url) {
        return reply('❌ Nada encontrado. Tente outro nome ou link.')
      }

      await reply(`⬇️ Baixando: *${video.title || 'música'}*...`)

      const outFile = path.join(tmpdir(), `${crypto.randomBytes(8).toString('hex')}.mp3`)

      await new Promise((resolve, reject) => {
        const cmd = `yt-dlp -x --audio-format mp3 --audio-quality 128K --no-playlist -o "${outFile}" "${video.url}"`
        exec(cmd, { timeout: 120000 }, (err, stdout, stderr) => {
          if (err) {
            // tenta com youtube-dl como fallback
            exec(
              `youtube-dl -x --audio-format mp3 --audio-quality 128K -o "${outFile}" "${video.url}"`,
              { timeout: 120000 },
              (err2) => {
                if (err2) reject(err)
                else resolve()
              }
            )
          } else {
            resolve()
          }
        })
      })

      if (!fs.existsSync(outFile)) {
        return reply('❌ Erro ao baixar. Verifique se o *yt-dlp* está instalado no sistema.\n\nInstale com:\n`sudo apt install yt-dlp` ou `pip install yt-dlp`')
      }

      const audioBuffer = fs.readFileSync(outFile)

      await client.sendMessage(
        from,
        {
          audio: audioBuffer,
          mimetype: 'audio/mpeg',
          fileName: `${(video.title || 'audio').replace(/[^\w\s.-]/g, '').slice(0, 60)}.mp3`,
          ptt: false
        },
        { quoted: info }
      )

      await client.sendMessage(
        from,
        {
          text: `🎵 *${video.title || 'Música'}*\n⏱️ ${video.timestamp || '—'}\n👁 ${video.views ? Number(video.views).toLocaleString('pt-BR') + ' views' : ''}`
        },
        { quoted: info }
      )

      try {
        fs.unlinkSync(outFile)
      } catch {}
    } catch (e) {
      console.error('[play]', e)
      reply('❌ Erro ao baixar o áudio. Tente outro nome/link ou verifique se o yt-dlp está instalado.')
    }
  }
}
