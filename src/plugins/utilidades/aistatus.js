'use strict'

const { listConfiguredProviders } = require('../../utils/aiText')

module.exports = {
  name: 'aistatus',
  description: 'Mostra quais APIs de IA estão configuradas',
  category: 'utilidades',
  aliases: ['iaapis', 'providers'],
  cooldown: 5,

  async execute({ reply }) {
    const p = listConfiguredProviders()
    const line = (k, on) => `${on ? '✅' : '⬜'} *${k}*`
    const msg =
      `🤖 *APIs de IA*\n\n` +
      `${line('DeepSeek', p.deepseek)}\n` +
      `${line('Groq', p.groq)}\n` +
      `${line('OpenRouter', p.openrouter)}\n` +
      `${line('Gemini', p.gemini)}\n` +
      `${line('HuggingFace', p.huggingface)}\n` +
      `${line('Pollinations', p.pollinations)} _(sempre)_\n\n` +
      `_Configure as keys no Render → Environment_`
    await reply(msg)
  }
}
