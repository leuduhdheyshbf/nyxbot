'use strict'

/**
 * GIFs para resenha — APIs gratuitas sem chave
 * Converte GIF → MP4 (ffmpeg) para gifPlayback funcionar no WhatsApp Web/Desktop
 * Render: waifu.pics costuma dar ENOTFOUND → prioriza nekos.life e otakugifs
 */

const axios = require('axios')
const fs = require('fs')
const path = require('path')
const os = require('os')
const { execFile } = require('child_process')
const { promisify } = require('util')
const execFileAsync = promisify(execFile)

const UA =
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'

/** Mapeamento ação → endpoints (ordem de tentativa) */
const ENDPOINTS = {
  kick: [
    'https://api.otakugifs.xyz/gif?reaction=kick',
    'https://nekos.life/api/v2/img/kick',
    'https://api.waifu.pics/sfw/kick',
    'https://api.waifu.pics/sfw/punch',
    'https://api.waifu.pics/sfw/slap'
  ],
  kiss: [
    'https://api.otakugifs.xyz/gif?reaction=kiss',
    'https://nekos.life/api/v2/img/kiss',
    'https://api.waifu.pics/sfw/kiss'
  ],
  hug: [
    'https://api.otakugifs.xyz/gif?reaction=hug',
    'https://nekos.life/api/v2/img/hug',
    'https://api.waifu.pics/sfw/hug'
  ],
  slap: [
    'https://api.otakugifs.xyz/gif?reaction=slap',
    'https://nekos.life/api/v2/img/slap',
    'https://api.waifu.pics/sfw/slap'
  ],
  bite: [
    'https://api.otakugifs.xyz/gif?reaction=bite',
    'https://api.waifu.pics/sfw/bite'
  ],
  cuddle: [
    'https://api.otakugifs.xyz/gif?reaction=cuddle',
    'https://nekos.life/api/v2/img/cuddle',
    'https://api.waifu.pics/sfw/cuddle'
  ],
  poke: [
    'https://api.otakugifs.xyz/gif?reaction=poke',
    'https://nekos.life/api/v2/img/poke',
    'https://api.waifu.pics/sfw/poke'
  ],
  pat: [
    'https://api.otakugifs.xyz/gif?reaction=pat',
    'https://nekos.life/api/v2/img/pat',
    'https://api.waifu.pics/sfw/pat'
  ],
  lick: [
    'https://api.otakugifs.xyz/gif?reaction=lick',
    'https://api.waifu.pics/sfw/lick'
  ],
  punch: [
    'https://api.otakugifs.xyz/gif?reaction=punch',
    'https://api.waifu.pics/sfw/punch'
  ],
  bonk: ['https://api.waifu.pics/sfw/bonk'],
  yeet: ['https://api.waifu.pics/sfw/yeet'],
  highfive: [
    'https://api.otakugifs.xyz/gif?reaction=highfive',
    'https://api.waifu.pics/sfw/highfive'
  ],
  handhold: ['https://api.waifu.pics/sfw/handhold'],
  wave: [
    'https://api.otakugifs.xyz/gif?reaction=wave',
    'https://api.waifu.pics/sfw/wave'
  ],
  dance: [
    'https://api.otakugifs.xyz/gif?reaction=dance',
    'https://api.waifu.pics/sfw/dance'
  ],
  glomp: ['https://api.waifu.pics/sfw/glomp'],
  nom: ['https://api.waifu.pics/sfw/nom'],
  happy: [
    'https://api.otakugifs.xyz/gif?reaction=happy',
    'https://api.waifu.pics/sfw/happy'
  ],
  smile: ['https://api.waifu.pics/sfw/smile'],
  wink: [
    'https://api.otakugifs.xyz/gif?reaction=wink',
    'https://api.waifu.pics/sfw/wink'
  ],
  blush: [
    'https://api.otakugifs.xyz/gif?reaction=blush',
    'https://api.waifu.pics/sfw/blush'
  ],
  smug: [
    'https://api.otakugifs.xyz/gif?reaction=smug',
    'https://api.waifu.pics/sfw/smug'
  ],
  cringe: ['https://api.waifu.pics/sfw/cringe'],
  cry: [
    'https://api.otakugifs.xyz/gif?reaction=cry',
    'https://nekos.life/api/v2/img/cry',
    'https://api.waifu.pics/sfw/cry'
  ],
  bully: ['https://api.waifu.pics/sfw/bully']
}

function extractUrl(data) {
  if (!data) return null
  if (typeof data.url === 'string' && data.url.startsWith('http')) return data.url
  if (typeof data.link === 'string' && data.link.startsWith('http')) return data.link
  if (data.images?.[0]?.url) return data.images[0].url
  return null
}

/**
 * Busca URL de GIF pela ação (kick, hug, kiss, slap, cuddle, etc.)
 * Alias público: getGif
 */
async function getGifUrl(action) {
  const key = String(action || '').toLowerCase().trim()
  const list = ENDPOINTS[key] || []

  for (const endpoint of list) {
    try {
      const { data } = await axios.get(endpoint, {
        timeout: 10000,
        headers: { 'User-Agent': UA, Accept: 'application/json' }
      })
      const url = extractUrl(data)
      if (url) return url
    } catch (err) {
      console.error(`[gifUtils] ${endpoint}:`, err.message)
    }
  }
  return null
}

/** Alias pedido pelo padrão dos plugins */
const getGif = getGifUrl

async function getGifUrlWithFallback(actions) {
  const list = Array.isArray(actions) ? actions : [actions]
  for (const action of list) {
    const url = await getGifUrl(action)
    if (url) return url
  }
  // sem fallback forçado para hug (evita .chute virar abraço)
  return null
}

/**
 * Baixa GIF e converte para MP4 (H.264 + yuv420p) para gifPlayback funcionar
 * no WhatsApp Web / Desktop. Retorna Buffer do MP4 ou null.
 */
async function gifToMp4Buffer(gifUrl) {
  const tmpDir = os.tmpdir()
  const id = `nyx-gif-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`
  const gifPath = path.join(tmpDir, `${id}.gif`)
  const mp4Path = path.join(tmpDir, `${id}.mp4`)

  try {
    const res = await axios.get(gifUrl, {
      responseType: 'arraybuffer',
      timeout: 15000,
      headers: { 'User-Agent': UA },
      maxContentLength: 15 * 1024 * 1024 // 15 MB
    })
    fs.writeFileSync(gifPath, Buffer.from(res.data))

    // Converte GIF → MP4 otimizado para WhatsApp (loop infinito via gifPlayback)
    await execFileAsync(
      'ffmpeg',
      [
        '-y',
        '-i', gifPath,
        '-movflags', 'faststart',
        '-pix_fmt', 'yuv420p',
        '-vf', 'scale=trunc(iw/2)*2:trunc(ih/2)*2',
        '-c:v', 'libx264',
        '-preset', 'ultrafast',
        '-crf', '28',
        '-an',
        mp4Path
      ],
      { timeout: 25000 }
    )

    const buffer = fs.readFileSync(mp4Path)
    return buffer
  } catch (err) {
    console.error('[gifUtils] gifToMp4Buffer:', err.message)
    return null
  } finally {
    try { fs.unlinkSync(gifPath) } catch {}
    try { fs.unlinkSync(mp4Path) } catch {}
  }
}

/**
 * Envia reação com GIF como VÍDEO (gifPlayback + mimetype video/mp4)
 * Funciona no celular E no WhatsApp Web/Desktop.
 */
async function sendGifReaction({ client, from, info, sender, target, caption, actions }) {
  try {
    const gifUrl = await getGifUrlWithFallback(actions)

    if (gifUrl) {
      // 1) Tenta converter GIF → MP4 e enviar como vídeo animado
      const mp4Buffer = await gifToMp4Buffer(gifUrl)
      if (mp4Buffer && mp4Buffer.length > 1000) {
        try {
          await client.sendMessage(
            from,
            {
              video: mp4Buffer,
              gifPlayback: true,
              mimetype: 'video/mp4',
              caption,
              mentions: [sender, target].filter(Boolean)
            },
            { quoted: info }
          )
          return
        } catch (e1) {
          console.error('[gifUtils] video (buffer) falhou:', e1.message)
        }
      }

      // 2) Fallback: tenta URL direta como vídeo
      try {
        await client.sendMessage(
          from,
          {
            video: { url: gifUrl },
            gifPlayback: true,
            mimetype: 'video/mp4',
            caption,
            mentions: [sender, target].filter(Boolean)
          },
          { quoted: info }
        )
        return
      } catch (e2) {
        console.error('[gifUtils] video (url) falhou:', e2.message)
      }

      // 3) Último recurso: envia como imagem (não anima no desktop, mas aparece)
      try {
        await client.sendMessage(
          from,
          {
            image: { url: gifUrl },
            caption,
            mentions: [sender, target].filter(Boolean)
          },
          { quoted: info }
        )
        return
      } catch (e3) {
        console.error('[gifUtils] image falhou:', e3.message)
      }
    }
  } catch (e) {
    console.error('[gifUtils] sendGifReaction:', e.message)
  }

  // Fallback total: só texto
  await client.sendMessage(
    from,
    { text: caption, mentions: [sender, target].filter(Boolean) },
    { quoted: info }
  )
}

function resolveTarget(info, args = []) {
  const ctx = info.message?.extendedTextMessage?.contextInfo
  let target =
    ctx?.participant ||
    ctx?.mentionedJid?.[0] ||
    info.message?.extendedTextMessage?.contextInfo?.mentionedJid?.[0]

  if (!target && args[0]) {
    const n = String(args[0]).replace(/\D/g, '')
    if (n.length >= 10) target = n + '@s.whatsapp.net'
  }
  return target || null
}

module.exports = {
  getGif,           // alias pedido
  getGifUrl,
  getGifUrlWithFallback,
  sendGifReaction,
  resolveTarget,
  ENDPOINTS
}
