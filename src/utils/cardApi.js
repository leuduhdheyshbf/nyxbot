'use strict'

/**
 * Geração de imagens para cards (cantada, rank, etc.)
 *
 * Ordem:
 *  1) RapidAPI (Flux / SD) — RAPIDAPI_KEY
 *  2) Hugging Face SD — HF_API_KEY
 *  3) Pollinations (grátis)
 *  4) placehold (só texto)
 *
 * Env:
 *   RAPIDAPI_KEY          (obrigatória pro Rapid)
 *   RAPIDAPI_IMAGE_HOST   (padrão: ai-text-to-image-generator-flux-free-api.p.rapidapi.com)
 *   RAPIDAPI_IMAGE_PATH   (padrão: /aaaaaaaaaaaaaaaaaiimagegenerator/quick.php)
 *   HF_API_KEY / HF_IMAGE_MODEL
 *   POLLINATIONS_MODEL    (padrão: flux)
 */

const fs = require('fs')
const path = require('path')
const os = require('os')
const axios = require('axios')

const UA =
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'

function tmpPng(prefix = 'nyx-card') {
  return path.join(
    os.tmpdir(),
    `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}.png`
  )
}

function saveBuffer(buf) {
  if (!buf || buf.length < 800) throw new Error('imagem vazia')
  const out = tmpPng()
  fs.writeFileSync(out, buf)
  return out
}

async function downloadToFile(url, timeout = 55000) {
  const res = await axios.get(url, {
    responseType: 'arraybuffer',
    timeout,
    headers: { 'User-Agent': UA, Accept: 'image/*,*/*' },
    maxContentLength: 15 * 1024 * 1024,
    maxRedirects: 5
  })
  return saveBuffer(Buffer.from(res.data))
}

function rapidKey() {
  return process.env.RAPIDAPI_KEY || process.env.X_RAPIDAPI_KEY || ''
}

function hfKey() {
  return process.env.HF_API_KEY || process.env.HUGGINGFACE_API_KEY || ''
}

const PROMPTS = {
  quote: (extra = '') =>
    [
      'dark gothic romantic atmosphere, beautiful mysterious woman with long black hair',
      'pale skin, intense eyes, dark makeup, lace, dramatic cinematic lighting',
      'deep purple and crimson tones, soft vignette, highly detailed, 4k',
      'no text, no watermark, no logo, no words',
      extra
    ]
      .filter(Boolean)
      .join(', '),
  rank: (extra = '') =>
    [
      'dark fantasy ranking podium, gothic cathedral background',
      'golden trophies, crimson neon lights, dramatic volumetric lighting',
      'esports leaderboard aesthetic, deep black purple red, highly detailed',
      'no text, no watermark, no logo',
      extra
    ]
      .filter(Boolean)
      .join(', ')
}

/**
 * RapidAPI — Flux free (ou outra API que você configurar)
 * Resposta costuma vir com URL ou base64
 */
async function fromRapidAPI({ mood = 'quote', prompt } = {}) {
  const key = rapidKey()
  if (!key) throw new Error('RAPIDAPI_KEY não configurada')

  const host =
    process.env.RAPIDAPI_IMAGE_HOST ||
    'ai-text-to-image-generator-flux-free-api.p.rapidapi.com'
  const apiPath =
    process.env.RAPIDAPI_IMAGE_PATH ||
    '/aaaaaaaaaaaaaaaaaiimagegenerator/quick.php'
  const finalPrompt = prompt || PROMPTS[mood]?.() || PROMPTS.quote()

  const res = await axios.post(
    `https://${host}${apiPath}`,
    {
      prompt: finalPrompt,
      style_id: Number(process.env.RAPIDAPI_STYLE_ID || 2),
      size: process.env.RAPIDAPI_SIZE || '1-1'
    },
    {
      timeout: 90000,
      headers: {
        'Content-Type': 'application/json',
        'x-rapidapi-host': host,
        'x-rapidapi-key': key,
        'User-Agent': UA
      }
    }
  )

  const data = res.data

  // formatos comuns de resposta
  let imgUrl =
    data?.url ||
    data?.image_url ||
    data?.imageUrl ||
    data?.output?.[0] ||
    data?.data?.url ||
    data?.result?.url ||
    data?.images?.[0]?.url ||
    (typeof data?.image === 'string' && data.image.startsWith('http') ? data.image : null)

  let b64 =
    data?.base64 ||
    data?.image_base64 ||
    data?.data?.base64 ||
    (typeof data?.image === 'string' && data.image.startsWith('data:') ? data.image : null) ||
    (typeof data === 'string' && data.startsWith('data:') ? data : null)

  if (imgUrl) return downloadToFile(imgUrl, 60000)

  if (b64) {
    const raw = String(b64).replace(/^data:image\/\w+;base64,/, '')
    return saveBuffer(Buffer.from(raw, 'base64'))
  }

  // alguns retornam array de base64
  if (Array.isArray(data?.output) && data.output[0]) {
    const o = data.output[0]
    if (typeof o === 'string' && o.startsWith('http')) return downloadToFile(o)
    if (typeof o === 'string') {
      return saveBuffer(Buffer.from(o.replace(/^data:image\/\w+;base64,/, ''), 'base64'))
    }
  }

  throw new Error('RapidAPI: resposta sem imagem reconhecível: ' + JSON.stringify(data).slice(0, 200))
}

async function fromHuggingFaceSD({ mood = 'quote', prompt } = {}) {
  const key = hfKey()
  if (!key) throw new Error('HF_API_KEY não configurada')

  const model =
    process.env.HF_IMAGE_MODEL || 'stabilityai/stable-diffusion-xl-base-1.0'
  const finalPrompt = prompt || PROMPTS[mood]?.() || PROMPTS.quote()

  const endpoints = [
    `https://router.huggingface.co/hf-inference/models/${model}`,
    `https://api-inference.huggingface.co/models/${model}`
  ]

  let lastErr
  for (const url of endpoints) {
    try {
      const res = await axios.post(
        url,
        {
          inputs: finalPrompt,
          parameters: {
            negative_prompt:
              'text, watermark, logo, words, letters, blurry, low quality, deformed',
            num_inference_steps: 28,
            guidance_scale: 7
          }
        },
        {
          responseType: 'arraybuffer',
          timeout: 90000,
          headers: {
            Authorization: `Bearer ${key}`,
            'Content-Type': 'application/json',
            Accept: 'image/png',
            'User-Agent': UA
          }
        }
      )
      const ctype = String(res.headers['content-type'] || '')
      if (ctype.includes('application/json')) {
        throw new Error(Buffer.from(res.data).toString('utf8').slice(0, 200))
      }
      return saveBuffer(Buffer.from(res.data))
    } catch (e) {
      lastErr = e
      console.error('[cardApi] HF:', e?.response?.status || e.message)
    }
  }
  throw lastErr || new Error('HF SD falhou')
}

async function fromPollinationsBg({ mood = 'quote', prompt } = {}) {
  const finalPrompt = prompt || PROMPTS[mood]?.() || PROMPTS.quote()
  const model = process.env.POLLINATIONS_MODEL || 'flux'
  const seed = Math.floor(Math.random() * 1e9)
  const url =
    `https://image.pollinations.ai/prompt/${encodeURIComponent(finalPrompt)}` +
    `?width=768&height=768&seed=${seed}&nologo=true&enhance=true&model=${encodeURIComponent(model)}`
  return downloadToFile(url, 60000)
}

async function fromPollinations({ title, emoji, text }) {
  const t = String(text || '').slice(0, 160)
  const titleS = String(title || 'NYX').slice(0, 40)
  const em = emoji || '✨'
  const prompt = [
    'Dark gothic WhatsApp style quote card',
    'deep black and dark purple background',
    `title: ${em} ${titleS}`,
    `text: "${t}"`,
    'no watermark'
  ].join(', ')
  const model = process.env.POLLINATIONS_MODEL || 'flux'
  const seed = Math.floor(Math.random() * 1e9)
  const url =
    `https://image.pollinations.ai/prompt/${encodeURIComponent(prompt)}` +
    `?width=768&height=512&seed=${seed}&nologo=true&model=${encodeURIComponent(model)}`
  return downloadToFile(url, 55000)
}

async function fromPlacehold({ title, emoji, text }) {
  const line1 = `${emoji || '✨'} ${String(title || 'NYX').toUpperCase()}`.slice(0, 40)
  const line2 = String(text || '').slice(0, 90)
  const body = encodeURIComponent(`${line1}\n\n${line2}`)
  const url = `https://placehold.co/700x400/1a121c/f0e6ea/png?text=${body}&font=roboto`
  return downloadToFile(url, 15000)
}

/** Fundo artístico: Rapid → HF → Pollinations */
async function generateBg({ mood = 'quote', prompt } = {}) {
  const errors = []

  if (rapidKey()) {
    try {
      return await fromRapidAPI({ mood, prompt })
    } catch (e) {
      errors.push('rapid: ' + e.message)
      console.error('[cardApi] RapidAPI falhou:', e.message)
    }
  }

  if (hfKey()) {
    try {
      return await fromHuggingFaceSD({ mood, prompt })
    } catch (e) {
      errors.push('hf: ' + e.message)
      console.error('[cardApi] HF falhou:', e.message)
    }
  }

  try {
    return await fromPollinationsBg({ mood, prompt })
  } catch (e) {
    errors.push('pollinations: ' + e.message)
    throw new Error(errors.join(' | ') || e.message)
  }
}

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
  generateBg,
  fromRapidAPI,
  fromHuggingFaceSD,
  fromPollinations,
  fromPollinationsBg,
  fromPlacehold
}
