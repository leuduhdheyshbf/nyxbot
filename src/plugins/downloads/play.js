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

// Lista de proxies (formato já testado)
const proxies = [
  "http://Chinaproxys:cpaproxys@92.112.175.210:6483",
"http://Chinaproxys:cpaproxys@45.38.89.51:5986",
"http://Chinaproxys:cpaproxys@23.26.154.40:6777",
"http://Chinaproxys:cpaproxys@23.26.154.215:6952",
"http://Chinaproxys:cpaproxys@92.112.175.3:6276",
"http://Chinaproxys:cpaproxys@185.72.240.6:7042",
"http://Chinaproxys:cpaproxys@23.129.252.220:6488",
"http://Chinaproxys:cpaproxys@85.198.47.157:6425",
"http://Chinaproxys:cpaproxys@85.198.47.98:6366",
"http://Chinaproxys:cpaproxys@85.198.45.232:6156"
];

function escolherProxy() {
  const indice = Math.floor(Math.random() * proxies.length);
  return proxies[indice];
}

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
      return /youtube\.com/i.test(txt) && txt.split('\n').filter((l) => l && !l.startsWith('#')).length > 3
    } catch {
      return false
    }
}

module.exports = {
  name: 'play',
  description: 'Baixa áudio do YouTube (modo rápido com proxy)',
  category: 'downloads',
  aliases: ['ytmp3', 'musica', 'song'],

  async execute({ client, from, info, args, prefix, reply }) {
    const q = (args || []).join(' ').trim()
    if (!q) {
      return reply(`❗ Digite o nome ou link da música.\nEx: ${prefix || '.'}play nome da musica`)
    }

    const useCookies = hasValidCookies()
    if (!useCookies) {
      console.log('[play] cookies.txt ausente ou inválido')
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
        const outFile = path.join(tmpdir(), `${id}.m4a`)

        const proxyEscolhido = escolherProxy();
      const cookieArg = useCookies ? `--cookies "${COOKIES}"` : ''
      const common = `--no-playlist --no-warnings --no-check-certificates ${cookieArg}`.trim()

      // Comando ultra rápido com proxy
      const cmd = `${BIN} --proxy "${proxyEscolhido}" -f "bestaudio[ext=m4a]/bestaudio" ${common} -o "${outFile}" "${video.url}"`

      await run(cmd)

      if (!fs.existsSync(outFile) || fs.statSync(outFile).size < 1000) {
        return reply('❌ Não foi possível baixar o áudio.')
      }

      const buf = fs.readFileSync(outFile)
      const safeTitle = String(video.title || 'audio')
      .replace(/[^\w\s.-]/g, '')
      .slice(0, 60)

      await client.sendMessage(
        from,
        {
          audio: buf,
          mimetype: 'audio/mp4',
          fileName: `${safeTitle}.m4a`,
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
          `⚡ Modo Rápido`
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
