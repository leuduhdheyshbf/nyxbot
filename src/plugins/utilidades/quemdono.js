'use strict'

/**
 * .dono — info do dono + atalho pro painel se for dono
 */

module.exports = {
  name: 'dono',
  description: 'Mostra info do dono do bot',
  category: 'utilidades',
  aliases: ['criador', 'owner', 'criadorbot'],
  cooldown: 2,

  async execute({ reply, reagir, config, isDono, prefix }) {
    await reagir('👑')
    const cfg = config || {}
    const nome = cfg.NomeDoDono || '—'
    const bot = cfg.NomeDoBot || 'Nyx Bot'
    const nums = Array.isArray(cfg.NumeroDoDono)
      ? cfg.NumeroDoDono.join(', ')
      : String(cfg.NumeroDoDono || '—')
    const p = prefix || '.'

    let text =
      `👑 *Dono do Bot*\n\n` +
      `Nome: *${nome}*\n` +
      `Número: \`${nums}\`\n` +
      `Bot: *${bot}*`

    if (isDono) {
      text += `\n\n🩸 Você é dono — use *${p}painel* pro menu completo.`
    }

    return reply(text)
  }
}
