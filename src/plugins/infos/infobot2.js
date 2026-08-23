module.exports = {
  name: 'infobot2',
  description: 'Info rápida do bot',
  category: 'infos',
  aliases: ['botstat'],
  async execute({ reply, config, cmdManager }) {
    const cmds = cmdManager?.allUnique?.()?.length || '?'
    await reply(`🤖 *${config?.NomeDoBot || 'Nyx'}*\nPrefixo: ${config?.prefix || '.'}\nComandos: ${cmds}\nUptime: ${Math.floor(process.uptime())}s`)
  }
}
