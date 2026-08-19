// plugins/cmds-aleatorios/ia.js
const fs = require('fs')
const path = require('path')
const axios = require('axios')

const DEEPSEEK_API_KEY = process.env.DEEPSEEK_API_KEY || 'sk-7c1d9c521b8f4c12abe5d81126e17604'
const GEMINI_API_KEY = process.env.GEMINI_API_KEY || 'AIzaSyB93z6L_gVHHIyBmwFxQARqrpw1EkaCr5g'

const HISTORY_FILE = path.join(process.cwd(), 'conversas_ia.json')
const MAX_HISTORY = 20

const DEEPSEEK_URL = 'https://api.deepseek.com/v1/chat/completions'
const GEMINI_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent'

const SYSTEM_PROMPT = `Você é a IA do Nyx Bot V1. Responda sempre em português, de forma direta, intensa e com estética dark/edgy. Use bordas ▬ ➤ ═ quando fizer sentido, mas sem exagerar. Seja útil e objetiva.`

const delay = (ms) => new Promise(res => setTimeout(res, ms))

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
  Object.keys(data).forEach(k => {
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

async function askDeepSeek(history, userText) {
  const messages = [
    { role: 'system', content: SYSTEM_PROMPT },
    ...history.map(m => ({ role: m.role, content: m.text })),
    { role: 'user', content: userText }
  ]

  const res = await axios.post(
    DEEPSEEK_URL,
    {
      model: 'deepseek-chat',
      messages,
      temperature: 0.8,
      max_tokens: 1024
    },
    {
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${DEEPSEEK_API_KEY}`
      },
      timeout: 45000
    }
  )

  return (res?.data?.choices?.[0]?.message?.content || '').trim()
}

async function askGemini(history, userText) {
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
    `${GEMINI_URL}?key=${GEMINI_API_KEY}`,
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

  return (
    res?.data?.candidates?.[0]?.content?.parts?.[0]?.text ||
    ''
  ).trim()
}

async function askIA(model, history, userText) {
  if (model === 'gemini') {
    return { model: 'gemini', text: await askGemini(history, userText) }
  }

  try {
    const text = await askDeepSeek(history, userText)
    if (!text) throw new Error('resposta vazia deepseek')
    return { model: 'deepseek', text }
  } catch (e) {
    console.error('[ia] deepseek falhou, fallback gemini:', e?.response?.data || e.message)
    const text = await askGemini(history, userText)
    return { model: 'gemini', text }
  }
}

module.exports = {
  name: 'ia',
  description: 'Converse com a DeepSeek ou Gemini',
  category: 'cmds-aleatorios',
  aliases: ['deepseek', 'gemini', 'ai', 'conversar'],
  async execute({ nyx, from, info, prefix, args, sender }) {
    const p = prefix || '.'
    const userId = sender || from
    const raw = (args || []).map(a => String(a)).join(' ').trim()
    const first = (args?.[0] || '').toLowerCase()

    if (first === 'sair' || first === 'limpar' || first === 'reset') {
      clearHistory(userId)
      return nyx.sendMessage(from, {
        text: frame(
          '⚔ 𝗜𝗔 𝗡𝗬𝗫',
          'Histórico apagado.\nModo conversa desativado.',
          `${p}ia [pergunta] para recomeçar`
        )
      }, { quoted: info })
    }

    if (!raw) {
      return nyx.sendMessage(from, {
        text: frame(
          '⚔ 𝗜𝗔 𝗡𝗬𝗫',
          `➤ ${p}ia [pergunta]
➤ ${p}ia deepseek [pergunta]
➤ ${p}ia gemini [pergunta]
➤ ${p}ia sair — limpa memória

Modelos: deepseek • gemini
Fallback automático ativo.`,
          'Escolha um modelo ou continue a conversa'
        )
      }, { quoted: info })
    }

    let model = getLastModel(userId)
    let pergunta = raw

    if (first === 'deepseek' || first === 'gemini') {
      model = first
      pergunta = (args.slice(1) || []).join(' ').trim()
    }

    if (!pergunta) {
      return nyx.sendMessage(from, {
        text: frame(
          '⚔ 𝗜𝗔 𝗡𝗬𝗫',
          `Faltou a pergunta.\n\n➤ ${p}ia ${model} [sua pergunta]`,
          null
        )
      }, { quoted: info })
    }

    if (model === 'deepseek' && (!DEEPSEEK_API_KEY || DEEPSEEK_API_KEY.includes('SUA_CHAVE'))) {
      model = 'gemini'
    }

    if (model === 'gemini' && (!GEMINI_API_KEY || GEMINI_API_KEY.includes('SUA_CHAVE'))) {
      return nyx.sendMessage(from, {
        text: frame(
          '⚠ 𝗘𝗥𝗥𝗢',
          'Nenhuma API key configurada.\nDefina DEEPSEEK_API_KEY e/ou GEMINI_API_KEY.',
          null
        )
      }, { quoted: info })
    }

    try {
      await nyx.sendMessage(from, {
        text: `⏳ *Consultando ${model}...*`
      }, { quoted: info })

      const history = getHistory(userId, model)
      const result = await askIA(model, history, pergunta)

      if (!result.text) throw new Error('resposta vazia')

      history.push({ role: 'user', text: pergunta })
      history.push({ role: 'assistant', text: result.text })
      setHistory(userId, result.model, history)

      await delay(1000)

      await nyx.sendMessage(from, {
        text: frame(
          `⚔ 𝗡𝗬𝗫 × ${result.model.toUpperCase()}`,
          result.text,
          `${p}ia sair — limpar memória`
        )
      }, { quoted: info })
    } catch (e) {
      console.error('[ia]', e?.response?.data || e.message)
      await nyx.sendMessage(from, {
        text: frame(
          '⚠ 𝗙𝗔𝗟𝗛𝗔 𝗡𝗔 𝗜𝗔',
          'Não foi possível obter resposta.\nTente novamente em instantes.',
          null
        )
      }, { quoted: info })
    }
  }
}
