'use strict'

/**
 * Utilitário de GIFs animados para comandos de interação (resenha)
 *
 * - APIs gratuitas sem chave: waifu.pics + nekos.life
 * - Retorna apenas a URL (não baixa o arquivo)
 * - WhatsApp processa o GIF no cliente
 * - Fallback em texto se a API falhar
 */

const axios = require('axios')

const UA =
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'

/** Mapeamento ação → endpoints (ordem de prioridade) */
const ENDPOINTS = {
  // Ações físicas
  kick: ['https://api.waifu.pics/sfw/kick'],
  kiss: ['https://api.waifu.pics/sfw/kiss', 'https://nekos.life/api/v2/img/kiss'],
  hug: ['https://api.waifu.pics/sfw/hug', 'https://nekos.life/api/v2/img/hug'],
  slap: ['https://api.waifu.pics/sfw/slap', 'https://nekos.life/api/v2/img/slap'],
  bite: ['https://api.waifu.pics/sfw/bite'],
  cuddle: ['https://api.waifu.pics/sfw/cuddle', 'https://nekos.life/api/v2/img/cuddle'],
  poke: ['https://api.waifu.pics/sfw/poke'],
  pat: ['https://api.waifu.pics/sfw/pat', 'https://nekos.life/api/v2/img/pat'],
  lick: ['https://api.waifu.pics/sfw/lick'],
  punch: ['https://api.waifu.pics/sfw/punch'],
  bonk: ['https://api.waifu.pics/sfw/bonk'],
  yeet: ['https://api.waifu.pics/sfw/yeet'],
  highfive: ['https://api.waifu.pics/sfw/highfive'],
  handhold: ['https://api.waifu.pics/sfw/handhold'],
  wave: ['https://api.waifu.pics/sfw/wave'],
  dance: ['https://api.waifu.pics/sfw/dance'],
  glomp: ['https://api.waifu.pics/sfw/glomp'],
  nom: ['https://api.waifu.pics/sfw/nom'],

  // Expressões / humor
  happy: ['https://api.waifu.pics/sfw/happy'],
  smile: ['https://api.waifu.pics/sfw/smile'],
  wink: ['https://api.waifu.pics/sfw/wink'],
  blush: ['https://api.waifu.pics/sfw/blush'],
  smug: ['https://api.waifu.pics/sfw/smug'],
  cringe: ['https://api.waifu.pics/sfw/cringe'],
  cry: ['https://api.waifu.pics/sfw/cry', 'https://nekos.life/api/v2/img/cry'],
  bully: ['https://api.waifu.pics/sfw/bully']
}

/**
 * Extrai URL do GIF da resposta da API
 */
function extractUrl(data) {
  if (!data) return null
  if (typeof data.url === 'string' && data.url.startsWith('http')) return data.url
  if (typeof data.link === 'string' && data.link.startsWith('http')) return data.link
  if (data.images?.[0]?.url) return data.images[0].url
  return null
}

/**
 * Busca um GIF aleatório para a ação.
 * @param {string} action
 * @returns {Promise<string|null>}
 */
async function getGifUrl(action) {
  const key = String(action || '').toLowerCase().trim()
  const list = ENDPOINTS[key] || ENDPOINTS.hug || []

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

/**
 * Tenta várias ações em ordem até achar um GIF.
 * @param {string|string[]} actions
 * @returns {Promise<string|null>}
 */
async function getGifUrlWithFallback(actions) {
  const list = Array.isArray(actions) ? actions : [actions]
  for (const action of list) {
    const url = await getGifUrl(action)
    if (url) return url
  }
  return null
}

/**
 * Envia GIF de reação (ou fallback em texto).
 * Centraliza a lógica para todos os plugins.
 */
async function sendGifReaction({ client, from, info, sender, target, caption, actions }) {
  try {
    const gifUrl = await getGifUrlWithFallback(actions)

    if (gifUrl) {
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
    }
  } catch (e) {
    console.error('[gifUtils] sendGifReaction:', e.message)
  }

  // Fallback texto
  await client.sendMessage(
    from,
    { text: caption, mentions: [sender, target] },
    { quoted: info }
  )
}

/**
 * Resolve o alvo (reply ou menção @)
 */
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
