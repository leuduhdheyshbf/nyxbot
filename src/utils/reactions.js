'use strict'

/**
 * Busca imagens/GIFs de reação em APIs públicas (sem API key).
 * Envia como GIF animado no WhatsApp (video + gifPlayback).
 * Retorna array de URLs (1 a 3).
 */

const https = require('https')
const http = require('http')

function getJson(url, timeout = 12000) {
  return new Promise((resolve, reject) => {
    const lib = url.startsWith('https') ? https : http
    const req = lib.get(url, { timeout }, (res) => {
      if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
        return getJson(res.headers.location, timeout).then(resolve).catch(reject)
      }
      let data = ''
      res.on('data', (c) => (data += c))
      res.on('end', () => {
        try {
          resolve(JSON.parse(data))
        } catch (e) {
          reject(e)
        }
      })
    })
    req.on('error', reject)
    req.on('timeout', () => {
      req.destroy()
      reject(new Error('timeout'))
    })
  })
}

/** Mapa ação → endpoints possíveis */
const ENDPOINTS = {
  kiss: [
    'https://api.waifu.pics/sfw/kiss',
    'https://nekos.life/api/v2/img/kiss'
  ],
  hug: [
    'https://api.waifu.pics/sfw/hug',
    'https://nekos.life/api/v2/img/hug'
  ],
  slap: [
    'https://api.waifu.pics/sfw/slap',
    'https://nekos.life/api/v2/img/slap'
  ],
  kick: [
    'https://api.waifu.pics/sfw/kick'
  ],
  pat: [
    'https://api.waifu.pics/sfw/pat',
    'https://nekos.life/api/v2/img/pat'
  ],
  poke: [
    'https://api.waifu.pics/sfw/poke'
  ],
  bite: [
    'https://api.waifu.pics/sfw/bite'
  ],
  cuddle: [
    'https://api.waifu.pics/sfw/cuddle',
    'https://nekos.life/api/v2/img/cuddle'
  ],
  punch: [
    'https://api.waifu.pics/sfw/punch'
  ],
  wave: [
    'https://api.waifu.pics/sfw/wave'
  ],
  dance: [
    'https://api.waifu.pics/sfw/dance'
  ],
  happy: [
    'https://api.waifu.pics/sfw/happy'
  ],
  wink: [
    'https://api.waifu.pics/sfw/wink'
  ],
  cringe: [
    'https://api.waifu.pics/sfw/cringe'
  ],
  highfive: [
    'https://api.waifu.pics/sfw/highfive'
  ],
  handhold: [
    'https://api.waifu.pics/sfw/handhold'
  ],
  smile: [
    'https://api.waifu.pics/sfw/smile'
  ],
  cry: [
    'https://api.waifu.pics/sfw/cry',
    'https://nekos.life/api/v2/img/cry'
  ]
}

function extractUrl(data) {
  if (!data) return null
  if (typeof data.url === 'string') return data.url
  if (typeof data.link === 'string') return data.link
  if (data.images?.[0]?.url) return data.images[0].url
  return null
}

/**
 * Detecta se a URL parece ser GIF animado
 */
function isLikelyGif(url) {
  if (!url) return false
  const u = url.toLowerCase()
  return u.includes('.gif') || u.includes('gif') || u.includes('waifu.pics')
}

/**
 * @param {string} action  kiss|hug|slap|kick|...
 * @param {number} count   1..3
 * @returns {Promise<string[]>}
 */
async function fetchReactionImages(action, count = 1) {
  const n = Math.max(1, Math.min(3, count))
  const list = ENDPOINTS[action] || ENDPOINTS.hug
  const urls = []
  const seen = new Set()

  for (let i = 0; i < n * 3 && urls.length < n; i++) {
    const ep = list[i % list.length]
    try {
      const data = await getJson(ep)
      const u = extractUrl(data)
      if (u && !seen.has(u)) {
        seen.add(u)
        urls.push(u)
      }
    } catch {
      /* tenta próximo */
    }
  }
  return urls
}

/**
 * Envia 1–3 reações no chat como GIF animado (quando possível).
 * Usa video + gifPlayback para animar no WhatsApp.
 */
async function sendReactionImages(client, from, info, urls, caption, mentions = []) {
  if (!urls.length) throw new Error('Nenhuma imagem encontrada')

  for (let i = 0; i < urls.length; i++) {
    const url = urls[i]
    const isFirst = i === 0
    const extra = isFirst
      ? { caption, ...(mentions.length ? { mentions } : {}) }
      : {}

    // Preferir GIF animado via video + gifPlayback
    // Fallback para image se a URL não for gif
    let payload
    if (isLikelyGif(url)) {
      payload = {
        video: { url },
        gifPlayback: true,
        ...extra
      }
    } else {
      payload = {
        image: { url },
        ...extra
      }
    }

    try {
      await client.sendMessage(from, payload, isFirst ? { quoted: info } : undefined)
    } catch (err) {
      // Fallback: se video falhar, tenta como image
      console.error('[reactions] video/gif falhou, tentando image:', err.message)
      await client.sendMessage(
        from,
        { image: { url }, ...extra },
        isFirst ? { quoted: info } : undefined
      )
    }
  }
}

module.exports = {
  fetchReactionImages,
  sendReactionImages,
  ENDPOINTS
}
