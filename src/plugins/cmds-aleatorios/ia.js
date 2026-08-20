'use strict'

/**
 * .ia — Conversa com IA (DeepSeek / Gemini + fallbacks)
 * Usa chaves de ambiente: DEEPSEEK_API_KEY, GEMINI_API_KEY, etc.
 * Histórico por usuário em conversas_ia.json
 */

const fs = require('fs')
const path = require('path')
const axios = require('axios')

const HISTORY_FILE = path.join(process.cwd(), 'conversas_ia.json')
const MAX_HISTORY = 20

const DEEPSEEK_URL = 'https://api.deepseek.com/v1/chat/completions'
const GEMINI_MODEL = process.env.GEMINI_MODEL || 'gemini-2.0-flash'
const GEMINI_URL = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent`

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
  return data[`last_${String(userId)}`] || 'deepseek'
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

function getDeepSeekKey() {
  return process.env.DEEPSEEK_API_KEY || ''
}

function getGeminiKey() {
  return process.env.GEMINI_API_KEY || ''
}

async function askDeepSeek(history, userText) {
  const key = getDeepSeekKey()
  if (!key) throw new Error('DEEPSEEK_API_KEY não configurada')

  const messages = [
    { role: 'system', content: SYSTEM_PROMPT },
    ...history.map((m) => ({ role: m.role, content: m.text })),
    { role: 'user', content: userText }
  ]

  const res = await axios.post(
    DEEPSEEK_URL,
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

async function askGemini(history, userText) {
  const key = getGeminiKey()
  if (!key) throw new Error('GEMINI_API_KEY não configurada')

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
    `${GEMINI_URL}?key=${key}`,
    {
      contents,
      generationConfig: {
        temperature: 0.8,
        maxOutputTokens: 1024
      }
    },
    {
      headers: { 'Content-Type': 'application/json' },
      timeout: 45000
    }
  )

  return (res?.data?.candidates?.[0]?.content?.parts?.[0]?.text || '').trim()
}

async function askIA(model, history, userText) {
  if (model === 'gemini') {
    return { model: 'gemini', text: await askGemini(history, userText) }
  }

  // deepseek com fallback automático para gemini
  try {
    const text = await askDeepSeek(history, userText)
    if (!text) throw new Error('resposta vazia deepseek')
    return { model: 'deepseek', text }
  } catch (e) {
    console.error('[ia] deepseek falhou, tentando gemini:', e?.response?.data || e.message)
    if (!getGeminiKey()) throw e
    const text = await askGemini(history, userText)
    return { model: 'gemini', text }
  }
}

module.exports = {
  name: 'ia',
  description: 'Converse com a DeepSeek ou Gemini',
  category: 'cmds-aleatorios',
  aliases: ['deepseek', 'gemini', 'ai', 'conversar'],
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
      const hasDs = !!getDeepSeekKey()
      const hasGm = !!getGeminiKey()
      return send(
        frame(
          '⚔ 𝗜𝗔 𝗡𝗬𝗫',
          `➤ ${p}ia [pergunta]
➤ ${p}ia deepseek [pergunta]
➤ ${p}ia gemini [pergunta]
➤ ${p}ia sair — limpa memória

Modelos: deepseek ${hasDs ? '✅' : '❌'} • gemini ${hasGm ? '✅' : '❌'}
Fallback automático ativo.`,
          'Configure DEEPSEEK_API_KEY e/ou GEMINI_API_KEY no ambiente'
        )
      )
    }

    let model = getLastModel(userId)
    let pergunta = raw

    if (first === 'deepseek' || first === 'gemini') {
      model = first
      pergunta = (args.slice(1) || []).join(' ').trim()
    }

    if (!pergunta) {
      return send(
        frame(
          '⚔ 𝗜𝗔 𝗡𝗬𝗫',
          `Faltou a pergunta.\n\n➤ ${p}ia ${model} [sua pergunta]`,
          null
        )
      )
    }

    // Se o modelo escolhido não tem chave, tenta o outro
    if (model === 'deepseek' && !getDeepSeekKey()) {
      if (getGeminiKey()) model = 'gemini'
      else {
        return send(
          frame(
            '⚠ 𝗘𝗥𝗥𝗢',
            'Nenhuma API key configurada.\nDefina DEEPSEEK_API_KEY e/ou GEMINI_API_KEY no ambiente (env / .env / Render).',
            null
          )
        )
      }
    }

    if (model === 'gemini' && !getGeminiKey()) {
      if (getDeepSeekKey()) model = 'deepseek'
      else {
        return send(
          frame(
            '⚠ 𝗘𝗥𝗥𝗢',
            'Nenhuma API key configurada.\nDefina DEEPSEEK_API_KEY e/ou GEMINI_API_KEY no ambiente.',
            null
          )
        )
      }
    }

    try {
      await send(`⏳ *Consultando ${model}...*`)

      const history = getHistory(userId, model)
      const result = await askIA(model, history, pergunta)

      if (!result.text) throw new Error('resposta vazia')

      history.push({ role: 'user', text: pergunta })
      history.push({ role: 'assistant', text: result.text })
      setHistory(userId, result.model, history)

      await delay(800)

      await send(
        frame(
          `⚔ 𝗡𝗬𝗫 × ${result.model.toUpperCase()}`,
          result.text,
          `${p}ia sair — limpar memória`
        )
      )
    } catch (e) {
      const detail =
        e?.response?.data?.error?.message ||
        e?.response?.data?.message ||
        e.message ||
        'erro desconhecido'
      console.error('[ia]', detail, e?.response?.data || '')
      await send(
        frame(
          '⚠ 𝗙𝗔𝗟𝗛𝗔 𝗡𝗔 𝗜𝗔',
          `Não foi possível obter resposta.\n\nMotivo: ${detail}\n\nVerifique as API keys e tente novamente.`,
          null
        )
      )
    }
  }
}
