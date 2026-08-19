'use strict'

/**
 * Reações GIF para WhatsApp (Baileys)
 *
 * Fluxo obrigatório (sem URL remota — URL vira "baixar arquivo" no Web):
 *  1. Busca URL na API
 *  2. Baixa o media para Buffer (com User-Agent)
 *  3. Se for GIF → converte SEMPRE para MP4 (H.264, sem áudio, yuv420p)
 *  4. Envia video buffer + gifPlayback: true
 *  5. Se conversão falhar → envia como image buffer (estático)
 *
 * Nunca envia { url } como video/image — isso causa o botão de download.
 */

const https = require('https')
const http = require('http')
const fs = require('fs')
const path = require('path')
const { tmpdir } = require('os')
const crypto = require('crypto')
const { execFile } = require('child_process')

const UA =
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'

function request(url, opts = {}) {
  return new Promise((resolve, reject) => {
    const lib = url.startsWith('https') ? https : http
    const req = lib.get(
      url,
      {
        timeout: opts.timeout || 20000,
        headers: {
          'User-Agent': UA,
          Accept: '*/*',
          ...(opts.headers || {})
        }
      },
      (res) => {
        if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
          const next = res.headers.location.startsWith('http')
            ? res.headers.location
            : new URL(res.headers.location, url).href
          res.resume()
          return request(next, opts).then(resolve).catch(reject)
        }
        const chunks = []
        res.on('data', (c) => chunks.push(c))
        res.on('end', () => {
          resolve({
            status: res.statusCode,
            headers: res.headers,
            buf: Buffer.concat(chunks)
          })
        })
        res.on('error', reject)
      }
    )
    req.on('error', reject)
    req.on('timeout', () => {
      req.destroy()
      reject(new Error('timeout'))
    })
  })
}

async function getJson(url) {
  const r = await request(url, { timeout: 12000 })
  if (r.status !== 200) throw new Error(`HTTP ${r.status}`)
  return JSON.parse(r.buf.toString('utf8'))
}

async function downloadBuffer(url) {
  const r = await request(url, { timeout: 25000 })
  if (r.status !== 200) throw new Error(`HTTP ${r.status}`)
  if (!r.buf || r.buf.length < 200) throw new Error('arquivo vazio')
  const ct = String(r.headers['content-type'] || '').toLowerCase()
  if (ct.includes('text/html') || ct.includes('application/json')) {
    throw new Error('resposta não é mídia: ' + ct)
  }
  const head = r.buf.slice(0, 32).toString('utf8').toLowerCase()
  if (head.includes('<!doctype') || head.includes('<html')) {
    throw new Error('baixou HTML em vez de mídia')
  }
  return { buf: r.buf, contentType: ct }
}

const ENDPOINTS = {
  kiss: ['https://api.waifu.pics/sfw/kiss', 'https://nekos.life/api/v2/img/kiss'],
  hug: ['https://api.waifu.pics/sfw/hug', 'https://nekos.life/api/v2/img/hug'],
  slap: ['https://api.waifu.pics/sfw/slap', 'https://nekos.life/api/v2/img/slap'],
  kick: ['https://api.waifu.pics/sfw/kick'],
  pat: ['https://api.waifu.pics/sfw/pat', 'https://nekos.life/api/v2/img/pat'],
  poke: ['https://api.waifu.pics/sfw/poke'],
  bite: ['https://api.waifu.pics/sfw/bite'],
  cuddle: ['https://api.waifu.pics/sfw/cuddle', 'https://nekos.life/api/v2/img/cuddle'],
  punch: ['https://api.waifu.pics/sfw/punch'],
  wave: ['https://api.waifu.pics/sfw/wave'],
  dance: ['https://api.waifu.pics/sfw/dance'],
  happy: ['https://api.waifu.pics/sfw/happy'],
  wink: ['https://api.waifu.pics/sfw/wink'],
  cringe: ['https://api.waifu.pics/sfw/cringe'],
  highfive: ['https://api.waifu.pics/sfw/highfive'],
  handhold: ['https://api.waifu.pics/sfw/handhold'],
  smile: ['https://api.waifu.pics/sfw/smile'],
  cry: ['https://api.waifu.pics/sfw/cry', 'https://nekos.life/api/v2/img/cry']
}

function extractUrl(data) {
  if (!data) return null
  if (typeof data.url === 'string') return data.url
  if (typeof data.link === 'string') return data.link
  if (data.images?.[0]?.url) return data.images[0].url
  return null
}

function isGifBuffer(buf) {
  return buf && buf.length > 6 && buf[0] === 0x47 && buf[1] === 0x49 && buf[2] === 0x46
}

function isJpeg(buf) {
  return buf && buf.length > 3 && buf[0] === 0xff && buf[1] === 0xd8
}

function isPng(buf) {
  return buf && buf.length > 4 && buf[0] === 0x89 && buf[1] === 0x50 && buf[2] === 0x4e && buf[3] === 0x47
}

function isWebp(buf) {
  return (
    buf &&
    buf.length > 12 &&
    buf[0] === 0x52 &&
    buf[1] === 0x49 &&
    buf[2] === 0x46 &&
    buf[3] === 0x46 &&
    buf.slice(8, 12).toString() === 'WEBP'
  )
}

function isMp4(buf) {
  return buf && buf.length > 12 && buf.slice(4, 8).toString() === 'ftyp'
}

/**
 * GIF/WEBP → MP4 H.264 sem áudio, otimizado pro WhatsApp gifPlayback
 */
function toMp4(inputBuf, extHint = 'gif') {
  return new Promise((resolve) => {
    const id = crypto.randomBytes(8).toString('hex')
    const inFile = path.join(tmpdir(), `nyx_rx_${id}.${extHint}`)
    const outFile = path.join(tmpdir(), `nyx_rx_${id}.mp4`)

    try {
      fs.writeFileSync(inFile, inputBuf)
    } catch (e) {
      return resolve(null)
    }

    const args = [
      '-y',
      '-i',
      inFile,
      '-an',
      '-c:v',
      'libx264',
      '-preset',
      'ultrafast',
      '-crf',
      '30',
      '-pix_fmt',
      'yuv420p',
      '-movflags',
      '+faststart',
      '-vf',
      "scale='min(480,iw)':'-2':force_original_aspect_ratio=decrease,scale=trunc(iw/2)*2:trunc(ih/2)*2",
      '-t',
      '8',
      outFile
    ]

    execFile('ffmpeg', args, { timeout: 30000, maxBuffer: 10 * 1024 * 1024 }, (err, _stdout, stderr) => {
      try {
        fs.unlinkSync(inFile)
      } catch {}

      if (err) {
        console.error('[reactions] ffmpeg falhou:', String(stderr || err.message || '').slice(0, 200))
        try {
          fs.unlinkSync(outFile)
        } catch {}
        return resolve(null)
      }

      try {
        const mp4 = fs.readFileSync(outFile)
        try {
          fs.unlinkSync(outFile)
        } catch {}
        if (mp4 && mp4.length > 800) return resolve(mp4)
      } catch {}
      resolve(null)
    })
  })
}

async function fetchReactionImages(action, count = 1) {
  const n = Math.max(1, Math.min(3, count))
  const list = ENDPOINTS[action] || ENDPOINTS.hug
  const urls = []
  const seen = new Set()

  for (let i = 0; i < n * 4 && urls.length < n; i++) {
    const ep = list[i % list.length]
    try {
      const data = await getJson(ep)
      const u = extractUrl(data)
      if (u && !seen.has(u)) {
        seen.add(u)
        urls.push(u)
      }
    } catch {
      /* próximo */
    }
  }
  return urls
}

/**
 * Envia reações. Só buffer — nunca URL.
 */
async function sendReactionImages(client, from, info, urls, caption, mentions = []) {
  if (!urls.length) throw new Error('Nenhuma imagem encontrada')

  let anySent = false

  for (let i = 0; i < urls.length; i++) {
    const url = urls[i]
    const isFirst = i === 0 && !anySent
    const extra = isFirst
      ? { caption: caption || undefined, ...(mentions.length ? { mentions } : {}) }
      : {}

    try {
      const { buf } = await downloadBuffer(url)
      console.log(
        `[reactions] baixou ${buf.length} bytes | gif=${isGifBuffer(buf)} jpeg=${isJpeg(buf)} png=${isPng(buf)} webp=${isWebp(buf)} mp4=${isMp4(buf)}`
      )

      let sent = false

      if (isMp4(buf)) {
        await client.sendMessage(
          from,
          {
            video: buf,
            mimetype: 'video/mp4',
            gifPlayback: true,
            ...extra
          },
          isFirst ? { quoted: info } : undefined
        )
        sent = true
      }

      if (!sent && (isGifBuffer(buf) || isWebp(buf))) {
        const ext = isGifBuffer(buf) ? 'gif' : 'webp'
        const mp4 = await toMp4(buf, ext)
        if (mp4) {
          console.log(`[reactions] convertido ${buf.length} → mp4 ${mp4.length} bytes`)
          await client.sendMessage(
            from,
            {
              video: mp4,
              mimetype: 'video/mp4',
              gifPlayback: true,
              ...extra
            },
            isFirst ? { quoted: info } : undefined
          )
          sent = true
        } else {
          console.error('[reactions] conversão ffmpeg falhou — enviando como imagem estática')
        }
      }

      if (!sent) {
        let mime = 'image/jpeg'
        if (isPng(buf)) mime = 'image/png'
        else if (isGifBuffer(buf)) mime = 'image/gif'
        else if (isWebp(buf)) mime = 'image/webp'

        await client.sendMessage(
          from,
          {
            image: buf,
            mimetype: mime,
            ...extra
          },
          isFirst ? { quoted: info } : undefined
        )
        sent = true
      }

      if (sent) anySent = true
    } catch (err) {
      console.error('[reactions] falha em', url.slice(0, 70), '→', err.message)
    }
  }

  if (!anySent) {
    await client.sendMessage(
      from,
      {
        text: caption || '💋',
        ...(mentions.length ? { mentions } : {})
      },
      { quoted: info }
    )
  }
}

module.exports = {
  fetchReactionImages,
  sendReactionImages,
  ENDPOINTS
}
