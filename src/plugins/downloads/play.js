'use strict'

const yts = require('yt-search')
const { exec } = require('child_process')
const fs = require('fs')
const path = require('path')
const { tmpdir } = require('os')
const crypto = require('crypto')

const ROOT = path.join(__dirname, '..', '..', '..')
const COOKIES = path.join(ROOT, 'cookies.txt')
const YTDLP = path.join(ROOT, 'yt-dlp')
const BIN = fs.existsSync(YTDLP) ? `./yt-dlp` : 'yt-dlp'

function run(cmd, timeout = 150000) {
  return new Promise((resolve, reject) => {
    exec(cmd, { timeout, maxBuffer: 20 * 1024 * 1024, cwd: ROOT }, (err, stdout, stderr) => {
      if (err) reject(Object.assign(err, { stderr: String(stderr || ''), stdout: String(stdout || '') }))
      else resolve(stdout)
    })
  })
}

function hasValidCookies() {
  if (!fs.existsSync(COOKIES)) return false
  try {
    const txt = fs.readFileSync(COOKIES, 'utf8')
    // precisa ter linhas de cookie do youtube, não só header
    return /youtube\.com/i.test(txt) && txt.split('\n').filter((l) => l && !l.startsWith('#')).length > 3
  } catch {
    return false
  }
}

/**
 * Estratégias em ordem (mais estáveis primeiro).
 * player_client alternativos costumam contornar 403 sem cookie válido.
 */
function buildAttempts(videoUrl, outFile, useCookies) {
  const cookieArg = useCookies ? `--cookies "${COOKIES}"` : ''
  const out = `-o "${outFile}"`
  const common = `--no-playlist --no-warnings --no-check-certificates ${cookieArg}`.trim()

  return [
    // 1) android + áudio
    `${BIN} -x --audio-format mp3 --audio-quality 128K --extractor-args "youtube:player_client=android" ${common} ${out} "${videoUrl}"`,
    // 2) ios
    `${BIN} -x --audio-format mp3 --audio-quality 128K --extractor-args "youtube:player_client=ios" ${common} ${out} "${videoUrl}"`,
    // 3) tv_embedded
    `${BIN} -x --audio-format mp3 --audio-quality 128K --extractor-args "youtube:player_client=tv_embedded" ${common} ${out} "${videoUrl}"`,
    // 4) web + mweb
    `${BIN} -x --audio-format mp3 --audio-quality 128K --extractor-args "youtube:player_client=web,mweb" ${common} ${out} "${videoUrl}"`,
    // 5) sem extractor-args (fallback clássico)
    `${BIN} -x --audio-format mp3 --audio-quality 128K ${common} ${out} "${videoUrl}"`,
    // 6) só baixar m4a sem converter (se ffmpeg falhar)
    `${BIN} -f "ba[ext=m4a]/ba" --extractor-args "youtube:player_client=android" ${common} ${out.replace('.mp3', '.%(ext)s')} "${videoUrl}"`
  ]
}

module.exports = {
  name: 'play',
  description: 'Baixa áudio do YouTube (yt-dlp + anti-403)',
  category: 'downloads',
  aliases: ['ytmp3', 'musica', 'song'],

  async execute({ client, from, info, args, prefix, reply }) {
    const q = (args || []).join(' ').trim()
    if (!q) {
      return reply(`❗ Digite o nome ou link da música.\nEx: ${prefix || '.'}play nome da musica`)
    }

    const useCookies = hasValidCookies()
    if (!useCookies) {
      // não bloqueia — tenta mesmo assim com player_client
      console.log('[play] cookies.txt ausente ou inválido — usando player_client alternativos')
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

      const id = crypto.randomBytes(8).toString('hex')
      const outFile = path.join(tmpdir(), `${id}.mp3`)
      const attempts = buildAttempts(video.url, outFile, useCookies)

      let lastErr = null
      let ok = false

      for (let i = 0; i < attempts.length; i++) {
        try {
          // limpa tentativas anteriores
          try { if (fs.existsSync(outFile)) fs.unlinkSync(outFile) } catch {}
          await run(attempts[i])
          if (fs.existsSync(outFile) && fs.statSync(outFile).size > 1000) {
            ok = true
            break
          }
          // tentativa 6 pode gerar .m4a
          const candidates = fs.readdirSync(tmpdir()).filter((f) => f.startsWith(id + '.'))
          for (const f of candidates) {
            const full = path.join(tmpdir(), f)
            if (fs.statSync(full).size > 1000) {
              // renomeia pra outFile se for m4a e converter com ffmpeg
              if (f.endsWith('.m4a') || f.endsWith('.webm') || f.endsWith('.opus')) {
                const ffmpegBin = fs.existsSync(path.join(ROOT, 'ffmpeg')) ? './ffmpeg' : 'ffmpeg'
                await run(`${ffmpegBin} -y -i "${full}" -vn -ab 128k "${outFile}"`, 60000)
                try { fs.unlinkSync(full) } catch {}
              } else {
                fs.renameSync(full, outFile)
              }
              if (fs.existsSync(outFile) && fs.statSync(outFile).size > 1000) {
                ok = true
                break
              }
            }
          }
          if (ok) break
        } catch (e) {
          lastErr = e
          console.error(`[play] tentativa ${i + 1} falhou:`, (e.stderr || e.message || '').slice(0, 200))
        }
      }

      if (!ok || !fs.existsSync(outFile)) {
        const msg = String(lastErr?.stderr || lastErr?.message || '')
        if (/403|forbidden|sign in|login|confirm you're not a bot/i.test(msg)) {
          return reply(
            '❌ YouTube bloqueou o download (403).\n\n' +
              '*Como corrigir de vez:*\n' +
              '1. No Chrome, instale a extensão *Get cookies.txt LOCALLY*\n' +
              '2. Abra youtube.com *logado*\n' +
              '3. Exporte os cookies e salve como `cookies.txt` na raiz do bot no GitHub\n' +
              '4. Faça push e aguarde o deploy\n\n' +
              'Sem cookies válidos o YouTube bloqueia a maioria dos downloads.'
          )
        }
        if (/yt-dlp|not found|ENOENT/i.test(msg)) {
          return reply('❌ *yt-dlp* não encontrado no servidor. Verifique o build.sh.')
        }
        return reply(`❌ Não consegui baixar.\n\`${(msg || 'erro desconhecido').slice(0, 180)}\``)
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
            (video.views ? `👁 ${Number(video.views).toLocaleString('pt-BR')} views` : '')
        },
        { quoted: info }
      )

      try { fs.unlinkSync(outFile) } catch {}
    } catch (e) {
      console.error('[play]', e)
      reply(`❌ Erro ao baixar: ${e.message}`)
    }
  }
}
