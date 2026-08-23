'use strict'

/**
 * .ia — Conversa com IA
 * Providers (ordem): DeepSeek → Groq → Gemini → HuggingFace
 * Env: DEEPSEEK_API_KEY, GROQ_API_KEY, GEMINI_API_KEY, HF_API_KEY
 * Opcional: GEMINI_MODEL (padrão: gemini-3.6-flash)
 */

const fs = require('fs')
const path = require('path')
const axios = require('axios')

const HISTORY_FILE = path.join(process.cwd(), 'conversas_ia.json')
const MAX_HISTORY = 20

const SYSTEM_PROMPT =
  'Você é a IA do Nyx Bot V2. Responda sempre em português brasileiro, de forma direta, intensa e com estética dark/edgy. Use bordas ▬ ➤ ═ quando fizer sentido, mas sem exagerar. Seja útil e objetiva.'

const delay = (ms) => new Promise((res) => setTimeout(res, ms))

function loadData() {
  try {
    if (!fs.existsSync(HISTORY_FILE)) return {}
    return JSON.parse(fs.readFileSync(HISTORY_FILE, 'utf8') || '{}')
  } catch {
    return {}
  }
}

function saveData(data) {
  try {
    fs.writeFileSync(HISTORY_FILE, JSON.stringify(data, null, 2))
  } catch (e) {
    console.error('[ia] erro ao salvar histórico:', e.message)
  }
}

function histKey(userId, model) {
  return `${String(userId)}_${model}`
}

function getHistory(userId, model) {
  const data = loadData()
  return data[histKey(userId, model)] || []
}

function setHistory(userId, model, messages) {
  const data = loadData()
  data[histKey(userId, model)] = messages.slice(-MAX_HISTORY)
  data[`last_${String(userId)}`] = model
  saveData(data)
}

function clearHistory(userId) {
  const data = loadData()
  const uid = String(userId)
  Object.keys(data).forEach((k) => {
    if (k.startsWith(uid + '_') || k === `last_${uid}`) delete data[k]
  })
  saveData(data)
}

function getLastModel(userId) {
  const data = loadData()
  return data[`last_${String(userId)}`] || 'auto'
}

function frame(title, body, footer) {
  return `
╔══════════════════════╗
║   ${title}
╚══════════════════════╝

▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬
${body}
▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬
${footer ? `\n➤ ${footer}` : ''}
`.trim()
}

const keys = {
  deepseek: () => process.env.DEEPSEEK_API_KEY || '',
  groq: () => process.env.GROQ_API_KEY || '',
  gemini: () => process.env.GEMINI_API_KEY || '',
  hf: () => process.env.HF_API_KEY || process.env.HUGGINGFACE_API_KEY || ''
}

async function askDeepSeek(history, userText) {
  const key = keys.deepseek()
  if (!key) throw new Error('DEEPSEEK_API_KEY não configurada')

  const messages = [
    { role: 'system', content: SYSTEM_PROMPT },
    ...history.map((m) => ({ role: m.role, content: m.text })),
    { role: 'user', content: userText }
  ]

  const res = await axios.post(
    'https://api.deepseek.com/v1/chat/completions',
    {
      model: process.env.DEEPSEEK_MODEL || 'deepseek-chat',
      messages,
      temperature: 0.8,
      max_tokens: 1024
    },
    {
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${key}`
      },
      timeout: 45000
    }
  )
  return (res?.data?.choices?.[0]?.message?.content || '').trim()
}

async function askGroq(history, userText) {
  const key = keys.groq()
  if (!key) throw new Error('GROQ_API_KEY não configurada')

  const messages = [
    { role: 'system', content: SYSTEM_PROMPT },
    ...history.map((m) => ({ role: m.role, content: m.text })),
    { role: 'user', content: userText }
  ]

  const res = await axios.post(
    'https://api.groq.com/openai/v1/chat/completions',
    {
      model: process.env.GROQ_MODEL || 'llama-3.3-70b-versatile',
      messages,
      temperature: 0.8,
      max_tokens: 1024
    },
    {
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${key}`
      },
      timeout: 30000
    }
  )
  return (res?.data?.choices?.[0]?.message?.content || '').trim()
}

async function askGemini(history, userText) {
  const key = keys.gemini()
  if (!key) throw new Error('GEMINI_API_KEY não configurada')

  // gemini-2.0-flash foi descontinuado → padrão novo
  const model = process.env.GEMINI_MODEL || 'gemini-3.6-flash'
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${key}`

  const contents = []
  for (const msg of history) {
    contents.push({
      role: msg.role === 'assistant' || msg.role === 'model' ? 'model' : 'user',
      parts: [{ text: msg.text }]
    })
  }
  contents.push({
    role: 'user',
    parts: [{ text: `${SYSTEM_PROMPT}\n\nPergunta: ${userText}` }]
  })

  const res = await axios.post(
    url,
    {
      contents,
      generationConfig: { temperature: 0.8, maxOutputTokens: 1024 }
    },
    { headers: { 'Content-Type': 'application/json' }, timeout: 45000 }
  )
  return (res?.data?.candidates?.[0]?.content?.parts?.[0]?.text || '').trim()
}

async function askHF(history, userText) {
  const key = keys.hf()
  if (!key) throw new Error('HF_API_KEY não configurada')

  const model = process.env.HF_MODEL || 'mistralai/Mistral-7B-Instruct-v0.3'
  const prompt =
    history.length > 0
      ? history.map((m) => `${m.role}: ${m.text}`).join('\n') + `\nuser: ${userText}`
      : userText

  const res = await axios.post(
    `https://api-inference.huggingface.co/models/${model}`,
    {
      inputs: `<s>[INST] ${SYSTEM_PROMPT}\n\n${prompt} [/INST]`,
      parameters: { max_new_tokens: 512, temperature: 0.8, return_full_text: false }
    },
    {
      headers: {
        Authorization: `Bearer ${key}`,
        'Content-Type': 'application/json'
      },
      timeout: 45000
    }
  )

  if (Array.isArray(res.data) && res.data[0]?.generated_text) return res.data[0].generated_text.trim()
  if (res.data?.generated_text) return res.data.generated_text.trim()
  return ''
}

const PROVIDERS = [
  { name: 'deepseek', fn: askDeepSeek, hasKey: () => !!keys.deepseek() },
  { name: 'groq', fn: askGroq, hasKey: () => !!keys.groq() },
  { name: 'gemini', fn: askGemini, hasKey: () => !!keys.gemini() },
  { name: 'hf', fn: askHF, hasKey: () => !!keys.hf() }
]

async function askIA(preferred, history, userText) {
  // Se escolheu um modelo específico e tem key, tenta só ele primeiro
  if (preferred && preferred !== 'auto') {
    const p = PROVIDERS.find((x) => x.name === preferred)
    if (p && p.hasKey()) {
      try {
        const text = await p.fn(history, userText)
        if (text) return { model: preferred, text }
      } catch (e) {
        console.error(`[ia] ${preferred} falhou:`, e?.response?.data || e.message)
      }
    }
  }

  // Fallback automático na ordem
  const errors = []
  for (const p of PROVIDERS) {
    if (!p.hasKey()) continue
    try {
      const text = await p.fn(history, userText)
      if (text) return { model: p.name, text }
      errors.push(`${p.name}: resposta vazia`)
    } catch (e) {
      const msg = e?.response?.data?.error?.message || e?.response?.data?.message || e.message
      errors.push(`${p.name}: ${msg}`)
      console.error(`[ia] ${p.name}:`, msg)
    }
  }

  throw new Error(errors.length ? errors.join(' | ') : 'Nenhuma API key configurada')
}

module.exports = {
  name: 'ia',
  description: 'Converse com DeepSeek / Groq / Gemini / HF',
  category: 'cmds-aleatorios',
  aliases: ['deepseek', 'gemini', 'groq', 'ai', 'conversar'],
  cooldown: 5,

  async execute({ nyx, client, from, info, prefix, args, sender, reply }) {
    const sock = nyx || client
    const p = prefix || '.'
    const userId = sender || from
    const raw = (args || []).map((a) => String(a)).join(' ').trim()
    const first = (args?.[0] || '').toLowerCase()

    const send = async (text) => {
      try {
        await sock.sendMessage(from, { text }, { quoted: info })
      } catch {
        if (typeof reply === 'function') await reply(text)
        else await sock.sendMessage(from, { text })
      }
    }

    if (first === 'sair' || first === 'limpar' || first === 'reset') {
      clearHistory(userId)
      return send(
        frame(
          '⚔ 𝗜𝗔 𝗡𝗬𝗫',
          'Histórico apagado.\nModo conversa desativado.',
          `${p}ia [pergunta] para recomeçar`
        )
      )
    }

    if (!raw) {
      const status = PROVIDERS.map((x) => `${x.name} ${x.hasKey() ? '✅' : '❌'}`).join(' • ')
      return send(
        frame(
          '⚔ 𝗜𝗔 𝗡𝗬𝗫',
          `➤ ${p}ia [pergunta]
➤ ${p}ia deepseek|groq|gemini|hf [pergunta]
➤ ${p}ia sair — limpa memória

Providers: ${status}
Fallback automático ativo.`,
          'Modelo Gemini padrão: gemini-3.6-flash'
        )
      )
    }

    let preferred = getLastModel(userId)
    let pergunta = raw

    const validModels = ['deepseek', 'groq', 'gemini', 'hf']
    if (validModels.includes(first)) {
      preferred = first
      pergunta = (args.slice(1) || []).join(' ').trim()
    }

    if (!pergunta) {
      return send(
        frame(
          '⚔ 𝗜𝗔 𝗡𝗬𝗫',
          `Faltou a pergunta.\n\n➤ ${p}ia ${preferred} [sua pergunta]`,
          null
        )
      )
    }

    if (!PROVIDERS.some((x) => x.hasKey())) {
      return send(
        frame(
          '⚠ 𝗘𝗥𝗥𝗢',
          'Nenhuma API key configurada.\nDefina DEEPSEEK_API_KEY, GROQ_API_KEY, GEMINI_API_KEY ou HF_API_KEY.',
          null
        )
      )
    }

    try {
      await send(`⏳ *Consultando IA...*`)

      const history = getHistory(userId, preferred === 'auto' ? 'auto' : preferred)
      const result = await askIA(preferred, history, pergunta)

      if (!result.text) throw new Error('resposta vazia')

      history.push({ role: 'user', text: pergunta })
      history.push({ role: 'assistant', text: result.text })
      setHistory(userId, result.model, history)

      await delay(600)

      await send(
        frame(
          `⚔ 𝗡𝗬𝗫 × ${result.model.toUpperCase()}`,
          result.text,
          `${p}ia sair — limpar memória`
        )
      )
    } catch (e) {
      const detail = e.message || 'erro desconhecido'
      console.error('[ia]', detail)
      await send(
        frame(
          '⚠ 𝗙𝗔𝗟𝗛𝗔 𝗡𝗔 𝗜𝗔',
          `Não foi possível obter resposta.\n\nMotivo:\n${detail}`,
          null
        )
      )
    }
  }
}
