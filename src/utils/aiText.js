'use strict'

/**
 * Texto por IA — multi-provider
 *
 * Ordem (só usa se tiver chave / disponível):
 *  1. DeepSeek   → DEEPSEEK_API_KEY
 *  2. Groq       → GROQ_API_KEY
 *  3. OpenRouter → OPENROUTER_API_KEY
 *  4. Gemini     → GEMINI_API_KEY
 *  5. HuggingFace→ HF_API_KEY (ou HUGGINGFACE_API_KEY)
 *  6. Pollinations (sem chave)
 *  7. Fallback local
 *
 * No Render: Environment → adicione as keys que tiver.
 */

const axios = require('axios')

const UA =
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'

const SYSTEM =
  'Você é o Nyx Bot, sarcástico e divertido. ' +
  'Responda SOMENTE em português brasileiro. ' +
  'Não use aspas envolvendo a resposta. ' +
  'Não explique, não use markdown, não numere. ' +
  'Só o texto final, curto (1 a 3 frases).'

function cleanOutput(raw, maxLen) {
  let text = String(raw || '')
    .replace(/^["'«»]|["'«»]$/g, '')
    .replace(/\*\*/g, '')
    .trim()

  if (text.startsWith('{')) {
    try {
      const j = JSON.parse(text)
      text = j.text || j.content || j.message || j.choices?.[0]?.message?.content || text
    } catch {}
  }

  // tira prefixos tipo "Resposta:"
  text = text.replace(/^(resposta|aqui vai|claro)[:\s]+/i, '').trim()
  return text.length >= 6 ? text.slice(0, maxLen) : null
}

/** OpenAI-compatible chat (DeepSeek, Groq, OpenRouter) */
async function chatOpenAI({ baseUrl, apiKey, model, userPrompt, timeout = 25000 }) {
  const { data } = await axios.post(
    `${baseUrl.replace(/\/$/, '')}/chat/completions`,
    {
      model,
      messages: [
        { role: 'system', content: SYSTEM },
        { role: 'user', content: userPrompt }
      ],
      temperature: 0.95,
      max_tokens: 220
    },
    {
      timeout,
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
        'User-Agent': UA,
        'HTTP-Referer': 'https://github.com/nyx-bot',
        'X-Title': 'Nyx Bot V2'
      }
    }
  )
  return data?.choices?.[0]?.message?.content || null
}

async function fromDeepSeek(userPrompt) {
  const key = process.env.DEEPSEEK_API_KEY
  if (!key) return null
  return chatOpenAI({
    baseUrl: 'https://api.deepseek.com/v1',
    apiKey: key,
    model: process.env.DEEPSEEK_MODEL || 'deepseek-chat',
    userPrompt
  })
}

async function fromGroq(userPrompt) {
  const key = process.env.GROQ_API_KEY
  if (!key) return null
  return chatOpenAI({
    baseUrl: 'https://api.groq.com/openai/v1',
    apiKey: key,
    model: process.env.GROQ_MODEL || 'llama-3.3-70b-versatile',
    userPrompt,
    timeout: 20000
  })
}

async function fromOpenRouter(userPrompt) {
  const key = process.env.OPENROUTER_API_KEY
  if (!key) return null
  return chatOpenAI({
    baseUrl: 'https://openrouter.ai/api/v1',
    apiKey: key,
    model: process.env.OPENROUTER_MODEL || 'meta-llama/llama-3.3-70b-instruct:free',
    userPrompt
  })
}

async function fromGemini(userPrompt) {
  const key = process.env.GEMINI_API_KEY
  if (!key) return null
  const model = process.env.GEMINI_MODEL || 'gemini-2.0-flash'
  const url =
    `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${key}`

  const { data } = await axios.post(
    url,
    {
      contents: [
        {
          role: 'user',
          parts: [{ text: SYSTEM + '\n\n' + userPrompt }]
        }
      ],
      generationConfig: {
        temperature: 0.95,
        maxOutputTokens: 220
      }
    },
    { timeout: 25000, headers: { 'Content-Type': 'application/json', 'User-Agent': UA } }
  )

  const parts = data?.candidates?.[0]?.content?.parts || []
  return parts.map((p) => p.text).filter(Boolean).join(' ') || null
}

async function fromHuggingFace(userPrompt) {
  const key = process.env.HF_API_KEY || process.env.HUGGINGFACE_API_KEY
  if (!key) return null
  const model =
    process.env.HF_MODEL || 'mistralai/Mistral-7B-Instruct-v0.3'

  const { data } = await axios.post(
    `https://api-inference.huggingface.co/models/${model}`,
    {
      inputs: `<s>[INST] ${SYSTEM}\n\n${userPrompt} [/INST]`,
      parameters: {
        max_new_tokens: 180,
        temperature: 0.9,
        return_full_text: false
      }
    },
    {
      timeout: 30000,
      headers: {
        Authorization: `Bearer ${key}`,
        'Content-Type': 'application/json',
        'User-Agent': UA
      }
    }
  )

  if (Array.isArray(data) && data[0]?.generated_text) return data[0].generated_text
  if (data?.generated_text) return data.generated_text
  return null
}

/** Sem chave */
async function fromPollinations(userPrompt) {
  const prompt = `${SYSTEM}\n\nPedido: ${userPrompt}`
  const url =
    'https://text.pollinations.ai/' +
    encodeURIComponent(prompt) +
    '?model=openai'

  const { data } = await axios.get(url, {
    timeout: 25000,
    responseType: 'text',
    headers: { 'User-Agent': UA, Accept: 'text/plain' },
    maxContentLength: 50_000
  })
  return data
}

const PROVIDERS = [
  { name: 'deepseek', fn: fromDeepSeek },
  { name: 'groq', fn: fromGroq },
  { name: 'openrouter', fn: fromOpenRouter },
  { name: 'gemini', fn: fromGemini },
  { name: 'huggingface', fn: fromHuggingFace },
  { name: 'pollinations', fn: fromPollinations }
]

/**
 * @param {string} instruction
 * @param {string|string[]} fallback
 * @param {{ maxLen?: number }} opts
 */
async function generateText(instruction, fallback, opts = {}) {
  const maxLen = opts.maxLen || 280
  const fb = Array.isArray(fallback)
    ? fallback[Math.floor(Math.random() * fallback.length)]
    : String(fallback || '…')

  const userPrompt = String(instruction)

  for (const { name, fn } of PROVIDERS) {
    try {
      const raw = await fn(userPrompt)
      const text = cleanOutput(raw, maxLen)
      if (text) {
        if (process.env.AI_DEBUG === '1') {
          console.log(`[aiText] ok via ${name}:`, text.slice(0, 60))
        }
        return text
      }
    } catch (e) {
      console.error(`[aiText] ${name}:`, e.response?.data?.error?.message || e.message)
    }
  }

  return String(fb).slice(0, maxLen)
}

const PROMPTS = {
  cantada: 'Crie UMA cantada engraçada e original para paquerar no WhatsApp.',
  piada: 'Crie UMA piada curta e limpa em português, com punchline.',
  piadaruim: 'Crie UMA piada propositalmente ruim e sem graça, estilo trocadilho fraco.',
  frase: 'Crie UMA frase marcante, gótica ou filosófica curta.',
  conselho: 'Dê UM conselho prático e divertido para o dia.',
  fato: 'Conte UM fato curioso e verdadeiro (ou bem plausível), em uma frase.',
  motivacao: 'Escreva UMA frase motivacional curta e impactante.',
  verdade: 'Crie UMA pergunta de verdade ou desafio (só a verdade), ousada mas sem ser pesada demais.',
  confessar: 'Invente UMA confissão engraçada e inofensiva na primeira pessoa.',
  zoeira: 'Escreva UMA frase de zoeira de grupo de WhatsApp, caótica e curta.',
  resposta: 'Dê UMA resposta misteriosa estilo bola mágica, curta.',
  '8ball': 'Responda como bola 8 mágica: sim/não/talvez com uma frase curta divertida.',
  energia: 'Descreva o clima/energia do dia em uma frase mística e divertida.',
  magia: 'Dê um "feitiço" engraçado ou conselho mágico em uma frase.',
  numerologia: 'Invente uma leitura numerológica curta e divertida (sem ser real).',
  caixa: 'Descreva o que saiu de uma caixa misteriosa, de forma surpresa e curta.',
  surpresa: 'Anuncie uma surpresa aleatória absurda em uma frase.',
  humor: 'Faça um comentário engraçado sobre o humor de alguém.',
  celebridade: 'Diga qual celebridade a pessoa lembra e por quê, em uma frase divertida.',
  horoscopo: 'Faça um horóscopo do dia genérico, curto e engraçado.',
  cantada2: 'Crie UMA cantada moderna e ousada (leve) para WhatsApp.'
}

async function generateByType(type, fallback) {
  const instruction = PROMPTS[type] || `Gere um texto curto do tipo: ${type}`
  return generateText(instruction, fallback)
}

/** Lista quais providers têm chave configurada (debug) */
function listConfiguredProviders() {
  return {
    deepseek: !!process.env.DEEPSEEK_API_KEY,
    groq: !!process.env.GROQ_API_KEY,
    openrouter: !!process.env.OPENROUTER_API_KEY,
    gemini: !!process.env.GEMINI_API_KEY,
    huggingface: !!(process.env.HF_API_KEY || process.env.HUGGINGFACE_API_KEY),
    pollinations: true
  }
}

module.exports = {
  generateText,
  generateByType,
  PROMPTS,
  listConfiguredProviders
}
