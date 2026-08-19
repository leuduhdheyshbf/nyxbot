module.exports = {
  name: 'sair',
  description: 'Faz o bot sair do grupo',
  category: 'dono',
  aliases: ['leave', 'sairgrupo'],
  async execute({ nyx, from, reply, isGroup, isDono, reagir }) {
    if (!isDono) return reply('❌ Só o dono pode usar.')
    if (!isGroup) return reply('❌ Só funciona em grupos.')

    await reagir('👋')
    await reply('👋 Saindo do grupo...')
    await nyx.groupLeave(from)
  }
}
