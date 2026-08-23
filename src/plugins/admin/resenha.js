module.exports = {
  name: 'resenha',
  description: 'Ativa/desativa o modo resenha no grupo',
  category: 'admin',
  aliases: ['modoresenha'],
  async execute({ reply, args, from, commandManager, isGroup }) {
    if (!isGroup) return reply('❗ Só funciona em grupos.')

    const acao = (args[0] || '').toLowerCase()
    const ativo = commandManager.ResenhaAtiva(from)

    if (acao === 'on' || acao === 'ativar' || acao === '1') {
      commandManager.DefinirResenhaAtiva(from, true)
      return reply('✅ Modo *resenha* ativado neste grupo!')
    }
    if (acao === 'off' || acao === 'desativar' || acao === '0') {
      commandManager.DefinirResenhaAtiva(from, false)
      return reply('🚫 Modo *resenha* desativado neste grupo.')
    }

    reply(
`🎐 *Modo Resenha:* ${ativo ? '✅ ATIVO' : '❌ DESATIVADO'}

Uso:
.resenha on — ativar
.resenha off — desativar`
    )
  }
}
