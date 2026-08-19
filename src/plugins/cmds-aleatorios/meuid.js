module.exports = {
  name: 'meuid',
  aliases: ['id', 'grupoid'],
  description: 'Mostra o ID do chat atual (grupo ou PV).',
  category: 'cmds-aleatorios',
  async execute({ from, reply, isGroup, pushname, sender }) {
    const tipo = isGroup ? 'Grupo' : 'PV (privado)'

    let texto = `🆔 *ID do Chat*\n\n`
    texto += `📌 Tipo: *${tipo}*\n`
    texto += `📍 ID: \`${from}\`\n`

    if (isGroup) {
      texto += `\n💡 Use este ID nos comandos:\n`
      texto += `• .ativar_grupo ${from} 30\n`
      texto += `• .reativar ${from} 30`
    } else {
      texto += `\n👤 Seu número (sender):\n\`${sender}\``
    }

    await reply(texto)
  }
}
