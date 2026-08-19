'use strict'

/**
 * GIFs para resenha — APIs gratuitas sem chave
 * Render: waifu.pics costuma dar ENOTFOUND → prioriza nekos.life e otakugifs
 */

const axios = require('axios')

const UA =
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'

/** Mapeamento ação → endpoints (ordem de tentativa) */
const ENDPOINTS = {
  kick: [
    'https://api.otakugifs.xyz/gif?reaction=kick',
    'https://nekos.life/api/v2/img/kick',
    'https://api.waifu.pics/sfw/kick'
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

async function getGifUrl(action) {
  const key = String(action || '').toLowerCase().trim()
  const list = ENDPOINTS[key] || ENDPOINTS.hug || []

  for (const endpoint of list) {
    try {
      const { data } = await axios.get(endpoint, {
        timeout: 8000,
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

async function getGifUrlWithFallback(actions) {
  const list = Array.isArray(actions) ? actions : [actions]
  for (const action of list) {
    const url = await getGifUrl(action)
    if (url) return url
  }
  // última tentativa: hug genérico
  return getGifUrl('hug')
}

async function sendGifReaction({ client, from, info, sender, target, caption, actions }) {
  try {
    const gifUrl = await getGifUrlWithFallback(actions)

    if (gifUrl) {
      try {
        await client.sendMessage(
          from,
          {
            video: { url: gifUrl },
            gifPlayback: true,
            caption,
            mentions: [sender, target]
          },
          { quoted: info }
        )
        return
      } catch (e1) {
        console.error('[gifUtils] video falhou:', e1.message)
        try {
          await client.sendMessage(
            from,
            {
              image: { url: gifUrl },
              caption,
              mentions: [sender, target]
            },
            { quoted: info }
          )
          return
        } catch (e2) {
          console.error('[gifUtils] image falhou:', e2.message)
        }
      }
    }
  } catch (e) {
    console.error('[gifUtils] sendGifReaction:', e.message)
  }

  await client.sendMessage(
    from,
    { text: caption, mentions: [sender, target] },
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
  getGifUrl,
  getGifUrlWithFallback,
  sendGifReaction,
  resolveTarget,
  ENDPOINTS
}
