'use strict'

const yts = require('yt-search')
const { exec } = require('child_process')
const fs = require('fs')
const path = require('path')
const { tmpdir } = require('os')
const crypto = require('crypto')

const ROOT = path.join(__dirname, '..', '..', '..')
const COOKIES = path.join(ROOT, 'cookies.txt')

function run(cmd, timeout = 120000) {
  return new Promise((resolve, reject) => {
    exec(cmd, { timeout, maxBuffer: 10 * 1024 * 1024 }, (err, stdout, stderr) => {
      if (err) reject(Object.assign(err, { stderr }))
      else resolve(stdout)
    })
  })
}

module.exports = {
  name: 'play',
  description: 'Baixa áudio do YouTube (yt-dlp + cookies)',
  category: 'downloads',
  aliases: ['ytmp3', 'musica', 'song'],

  async execute({ client, from, info, args, prefix, reply }) {
    const q = (args || []).join(' ').trim()
    if (!q) {
      return reply(`❗ Digite o nome ou link da música.\nEx: ${prefix || '.'}play nome da musica`)
    }

    const hasCookies = fs.existsSync(COOKIES)
    if (!hasCookies) {
      await reply(
        '⚠️ *cookies.txt* não encontrado na raiz do bot.\n' +
          'O download pode falhar com erro 403.\n\n' +
          'Coloque o arquivo `cookies.txt` (exportado do navegador) em:\n' +
          `\`${ROOT}/cookies.txt\``
      )
    }

    try {
      await reply('🔎 Procurando...')

      let video
      if (/youtube\.com|youtu\.be/i.test(q)) {
        let videoId = null
        if (q.includes('v=')) videoId = q.split('v=')[1]?.split('&')[0]
        else videoId = q.split('/').pop()?.split('?')[0]
        if (videoId) {
          const r = await yts({ videoId })
          video = r.videos?.[0] || (r.title ? r : null)
        }
      } else {
        const r = await yts(q)
        video = r.videos?.[0]
      }

      if (!video?.url) return reply('❌ Nada encontrado. Tente outro nome/link.')

      await reply(`⬇️ Baixando: *${video.title || 'música'}*...`)

      const outFile = path.join(tmpdir(), `${crypto.randomBytes(8).toString('hex')}.mp3`)
      const cookieArg = hasCookies ? `--cookies "${COOKIES}"` : ''
      const baseOpts = `-x --audio-format mp3 --audio-quality 0 --no-playlist --no-warnings ${cookieArg}`

      try {
        await run(`yt-dlp ${baseOpts} -o "${outFile}" "${video.url}"`)
      } catch (e1) {
        // fallback sem quality 0
        try {
          await run(`yt-dlp -x --audio-format mp3 --audio-quality 128K --no-playlist ${cookieArg} -o "${outFile}" "${video.url}"`)
        } catch (e2) {
          const msg = String(e2.stderr || e2.message || '')
          if (/403|forbidden|sign in|login/i.test(msg)) {
            return reply(
              '❌ YouTube bloqueou o download (403).\n\n' +
                'Atualize o *cookies.txt*:\n' +
                '1. Extensão “Get cookies.txt LOCALLY” no Chrome\n' +
                '2. Exporte cookies do youtube.com\n' +
                `3. Salve em \`${ROOT}/cookies.txt\`\n` +
                '4. Tente de novo'
            )
          }
          if (/yt-dlp|not found|ENOENT/i.test(msg + e2.message)) {
            return reply('❌ *yt-dlp* não encontrado.\nInstale: `sudo apt install yt-dlp` ou `pip install yt-dlp`')
          }
          throw e2
        }
      }

      if (!fs.existsSync(outFile)) {
        return reply('❌ Arquivo de áudio não foi gerado. Tente outro link.')
      }

      const buf = fs.readFileSync(outFile)
      const safeTitle = String(video.title || 'audio')
        .replace(/[^\w\s.-]/g, '')
        .slice(0, 60)

      await client.sendMessage(
        from,
        {
          audio: buf,
          mimetype: 'audio/mpeg',
          fileName: `${safeTitle}.mp3`,
          ptt: false
        },
        { quoted: info }
      )

      await client.sendMessage(
        from,
        {
          text:
            `🎵 *${video.title || 'Música'}*\n` +
            `⏱️ ${video.timestamp || '—'}\n` +
            (video.views
              ? `👁 ${Number(video.views).toLocaleString('pt-BR')} views`
              : '')
        },
        { quoted: info }
      )

      try {
        fs.unlinkSync(outFile)
      } catch {}
    } catch (e) {
      console.error('[play]', e)
      reply(`❌ Erro ao baixar: ${e.message}`)
    }
  }
}
