module.exports = {
  name: 'roleta',
  description: 'Roleta russa',
  category: 'resenha',
  aliases: ['roletarussa'],
  async execute({ nyx, from, info, reply, reagir, isGroup, groupMembers, sender }) {
    if (!isGroup) return reply('❌ Só em grupos.')
    await reagir('🔫')
    const members = (groupMembers||[]).map(m=>m.id||m).filter(Boolean)
    if (members.length < 2) return reply('Grupo pequeno.')
    // 1 em 6 "morre"
    if (Math.random() < 1/6) {
      await nyx.sendMessage(from, {
        text: `💥 BANG!\n\n@${sender.split('@')[0]} perdeu na roleta russa!`,
        mentions: [sender]
      }, { quoted: info })
    } else {
      reply(`🔫 *Click!* … nada aconteceu.\n@${sender.split('@')[0]} sobreviveu.`, )
    }
  }
}
