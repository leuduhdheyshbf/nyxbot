'use strict'

/**
 * APIs de card/imagem para cantada, piada, 8ball, etc.
 * Ordem:
 *  1) Pollinations (card gótico por IA — grátis)
 *  2) placehold.co (texto exato, simples)
 * Fallback: quem chamar deve usar canvas local
 */

const fs = require('fs')
const path = require('path')
const os = require('os')
const axios = require('axios')

const UA =
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'

function tmpPng() {
  return path.join(
    os.tmpdir(),
    `nyx-card-${Date.now()}-${Math.random().toString(36).slice(2, 8)}.png`
  )
}

async function downloadToFile(url, timeout = 45000) {
  const res = await axios.get(url, {
    responseType: 'arraybuffer',
    timeout,
    headers: { 'User-Agent': UA, Accept: 'image/*,*/*' },
    maxContentLength: 12 * 1024 * 1024,
    maxRedirects: 5
  })
  const buf = Buffer.from(res.data)
  if (!buf || buf.length < 800) throw new Error('imagem vazia')
  const out = tmpPng()
  fs.writeFileSync(out, buf)
  return out
}

/**
 * Pollinations — card visual gótico (texto pode variar um pouco)
 */
async function fromPollinations({ title, emoji, text }) {
  const t = String(text || '').slice(0, 180)
  const titleS = String(title || 'NYX').slice(0, 40)
  const em = emoji || '✨'

  const prompt = [
    'Dark gothic WhatsApp style quote card',
    'deep black and dark purple background',
    'subtle red neon border',
    `title in red at the top: ${em} ${titleS}`,
    `centered elegant white text exactly: "${t}"`,
    'clean layout, high contrast, no watermark, no logo, soft vignette'
  ].join(', ')

  const seed = Math.floor(Math.random() * 1e9)
  const url =
    `https://image.pollinations.ai/prompt/${encodeURIComponent(prompt)}` +
    `?width=768&height=512&seed=${seed}&nologo=true&enhance=true`

  return downloadToFile(url, 55000)
}

/**
 * placehold.co — texto EXATO (mais simples visualmente)
 */
async function fromPlacehold({ title, emoji, text }) {
  const line1 = `${emoji || '✨'} ${String(title || 'NYX').toUpperCase()}`.slice(0, 40)
  const line2 = String(text || '').slice(0, 90)
  // placehold usa \n com encode
  const body = encodeURIComponent(`${line1}\n\n${line2}`)
  const url =
    `https://placehold.co/700x400/1a121c/f0e6ea/png` +
    `?text=${body}&font=roboto`

  return downloadToFile(url, 15000)
}

/**
 * Tenta APIs em ordem. Retorna path do PNG ou null.
 * Preferência: exact=true → placehold primeiro (texto fiel)
 */
async function fetchCardImage({ title, emoji, text, exact = false } = {}) {
  const order = exact
    ? [fromPlacehold, fromPollinations]
    : [fromPollinations, fromPlacehold]

  for (const fn of order) {
    try {
      const file = await fn({ title, emoji, text })
      if (file && fs.existsSync(file)) return file
    } catch (e) {
      console.error(`[cardApi] ${fn.name}:`, e.message)
    }
  }
  return null
}

module.exports = {
  fetchCardImage,
  fromPollinations,
  fromPlacehold
}
