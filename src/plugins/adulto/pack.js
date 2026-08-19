module.exports = {
  name: 'pack',
  description: 'Aviso sobre packs (só free)',
  category: 'adulto',
  aliases: ['packs', 'only'],
  async execute({ reply, command }) {
    if (command === 'only') {
      return reply(
`⚠️ *OnlyFans / Fansly / Privacy*\n\nO bot *não baixa* conteúdo pago nem contorna paywall.\n\nUse:\n• .xxx <link público free>\n• .nsfw (imagens free)\n• .menu18`
      )
    }
    await reply(
`📦 *Packs*\n\nNão hospedamos packs.\nPra vídeo free use:\n*.xxx <link do site free>*\n\nExemplos de site free: xnxx, xvideos, spankbang...\n\n*.menu18* — ver tudo +18`
    )
  }
}
