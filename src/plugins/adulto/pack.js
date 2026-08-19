module.exports = {
  name: 'pack',
  description: 'Aviso sobre packs (só free)',
  category: 'adulto',
  aliases: ['packs', 'only'],
  async execute({ reply, command }) {
    if (command === 'only') {
      return reply(
`⚠️ *OnlyFans / Fansly / Privacy*

O bot *não baixa* conteúdo pago nem contorna paywall.

Use:
• .xxx <link público free>
• .nsfw (imagens free)`
      )
    }
    await reply(
`📦 *Packs*

Não hospedamos packs.
Pra vídeo free use:
*.xxx <link do site free>*

Exemplos de site free: xnxx, xvideos, spankbang...`
    )
  }
}
