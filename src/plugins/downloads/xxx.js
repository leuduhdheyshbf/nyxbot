const { exec } = require('child_process')
const fs = require('fs')
const path = require('path')
const { tmpdir } = require('os')
const Crypto = require('crypto')

// Sites públicos/free comuns (yt-dlp suporta vários)
const SITES_OK = [
  'xnxx.com',
  'xvideos.com',
  'xhamster.com',
  'pornhub.com',
  'spankbang.com',
  'redtube.com',
  'youporn.com',
  'tube8.com',
  'eporner.com',
  'sxyprn.com',
  'dood',
  'streamtape',
  'mixdrop',
  'mp4upload',
  'ok.ru',
  'youtube.com',
  'youtu.be'
]

module.exports = {
  name: 'xxx',
  description: 'Baixa vídeo adulto de link público/free',
  category: 'downloads',
  aliases: ['xnxx', 'xvideos', 'porn', 'adulto'],
  async execute({ nyx, from, info, reply, reagir, q }) {
    if (!q || !q.startsWith('http')) {
      return reply(
`❗ *Uso:* .xxx <link do vídeo>

📌 Sites free/públicos (exemplos):
• xnxx / xvideos / xhamster
• pornhub (vídeos free)
• spankbang / eporner
• outros hosts públicos

⚠️ Só funciona com link *aberto/grátis*.
Não baixa OnlyFans, Fansly nem paywall.`
      )
    }

    const link = q.trim().split(/\s+/)[0]
    const hostOk = SITES_OK.some(s => link.toLowerCase().includes(s))
    if (!hostOk) {
      // tenta mesmo assim — yt-dlp pode conhecer o site
      await reagir('⚠️')
    }

    try {
      await reagir('⬇️')
      reply('⬇️ Baixando vídeo... (pode demorar)')

      const id = Crypto.randomBytes(6).toString('hex')
      const outFile = path.join(tmpdir(), `${id}.mp4`)
      const outTpl = path.join(tmpdir(), `${id}.%(ext)s`)

      // Qualidade limitada pra caber no WhatsApp (~50MB)
      const cmd = [
        'yt-dlp',
        '--no-playlist',
        '-f', '"bv*[height<=480]+ba/b[height<=480]/b"',
        '--merge-output-format', 'mp4',
        '--max-filesize', '45M',
        '-o', `"${outTpl}"`,
        `"${link}"`
      ].join(' ')

      await new Promise((resolve, reject) => {
        exec(cmd, { timeout: 180000 }, (err, stdout, stderr) => {
          if (err) return reject(new Error(stderr || err.message))
          resolve(stdout)
        })
      })

      // yt-dlp pode salvar com extensão diferente
      let file = outFile
      if (!fs.existsSync(file)) {
        const candidates = fs.readdirSync(tmpdir())
          .filter(f => f.startsWith(id + '.'))
          .map(f => path.join(tmpdir(), f))
        file = candidates.find(f => fs.existsSync(f))
      }

      if (!file || !fs.existsSync(file)) {
        return reply('❌ Não consegui baixar.\n• Confira se o link é público/free\n• Instale yt-dlp: `sudo pacman -S yt-dlp`')
      }

      const size = fs.statSync(file).size
      if (size > 50 * 1024 * 1024) {
        try { fs.unlinkSync(file) } catch {}
        return reply('❌ Vídeo muito grande pro WhatsApp (máx ~50MB).\nTente outro link ou qualidade menor.')
      }

      if (size < 1000) {
        try { fs.unlinkSync(file) } catch {}
        return reply('❌ Arquivo inválido. Link pode estar protegido ou offline.')
      }

      await nyx.sendMessage(from, {
        video: fs.readFileSync(file),
        caption: '✅ Vídeo baixado\n⚔ Nyx Bot'
      }, { quoted: info })

      try { fs.unlinkSync(file) } catch {}
      await reagir('✅')
    } catch (e) {
      console.error('[xxx]', e?.message || e)
      await reagir('❌')
      const msg = String(e?.message || e)
      if (msg.includes('yt-dlp') || msg.includes('not found') || msg.includes('não encontrado')) {
        return reply('❌ *yt-dlp* não está instalado.\n\nNo CachyOS:\n`sudo pacman -S yt-dlp`')
      }
      reply('❌ Falha no download.\nLink privado, expirado ou site não suportado.')
    }
  }
}
