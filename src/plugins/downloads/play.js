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
const FFMPEG = fs.existsSync(path.join(ROOT, 'ffmpeg')) ? './ffmpeg' : 'ffmpeg'

// Lista de proxies
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

let proxyIndex = 0;

function escolherProxy() {
  const proxy = proxies[proxyIndex];
  proxyIndex = (proxyIndex + 1) % proxies.length;
  return proxy;
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
  description: 'Baixa áudio do YouTube com fallback de proxies e formatos',
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
        const outFile = path.join(tmpdir(), `${id}.mp3`)
        const rawFile = path.join(tmpdir(), `${id}.raw`)

        const cookieArg = useCookies ? `--cookies "${COOKIES}"` : ''
        const common = `--no-playlist --no-warnings --no-check-certificates ${cookieArg}`.trim()

        let success = false;
        let tentativas = 0;
        let lastError = null;

        while (!success && tentativas < proxies.length) {
          const proxyEscolhido = escolherProxy();
          tentativas++;

          try {
            console.log(`[play] Tentativa ${tentativas} com proxy ${proxyEscolhido}`);

            // Tenta baixar o melhor áudio
            let downloadCmd = `${BIN} --proxy "${proxyEscolhido}" -f "bestaudio/best" ${common} -o "${rawFile}" "${video.url}"`;
            await run(downloadCmd);

            // Se funcionou, verifica o arquivo
            const files = fs.readdirSync(tmpdir());
            const downloadedFile = files.find(f => f.startsWith(id) && fs.statSync(path.join(tmpdir(), f)).size > 1000);
            if (downloadedFile) {
              success = true;
              break;
            }
          } catch (e) {
            lastError = e;
            console.log(`[play] Proxy ${proxyEscolhido} falhou: ${e.message}`);
            // Não faz nada, tenta o próximo
          }
        }

        // Se nenhum proxy funcionou, tenta fallback com formato 18 (vídeo 360p)
        if (!success) {
          console.log('[play] Todos os proxies falharam. Tentando fallback com formato 18...');
          const proxyEscolhido = escolherProxy();
          const downloadCmd = `${BIN} --proxy "${proxyEscolhido}" -f "18" ${common} -o "${rawFile}" "${video.url}"`;
          await run(downloadCmd);
          success = true;
        }

        // Verifica se o arquivo foi baixado
        const files = fs.readdirSync(tmpdir());
        const downloadedFile = files.find(f => f.startsWith(id) && fs.statSync(path.join(tmpdir(), f)).size > 1000);
        if (!downloadedFile) {
          return reply('❌ Não foi possível baixar o áudio com nenhum proxy ou fallback.');
        }

        const downloadedPath = path.join(tmpdir(), downloadedFile);

        // Converte para MP3 usando ffmpeg
        await run(`${FFMPEG} -y -i "${downloadedPath}" -vn -ab 128k "${outFile}"`, 60000);

        try { fs.unlinkSync(downloadedPath) } catch {}

        if (!fs.existsSync(outFile) || fs.statSync(outFile).size < 1000) {
          return reply('❌ Erro ao converter para MP3.');
        }

        const buf = fs.readFileSync(outFile);
        const safeTitle = String(video.title || 'audio')
        .replace(/[^\w\s.-]/g, '')
        .slice(0, 60);

        await client.sendMessage(
          from,
          {
            audio: buf,
            mimetype: 'audio/mpeg',
            fileName: `${safeTitle}.mp3`,
            ptt: false
          },
          { quoted: info }
        );

        await client.sendMessage(
          from,
          {
            text:
            `🎵 *${video.title || 'Música'}*\n` +
            `⏱️ ${video.timestamp || '—'}\n` +
            `⚡ Baixado e convertido com sucesso!`
          },
          { quoted: info }
        );

        try { fs.unlinkSync(outFile) } catch {}
    } catch (e) {
      console.error('[play]', e);
      reply(`❌ Erro ao baixar: ${e.message}`);
    }
  }
};
