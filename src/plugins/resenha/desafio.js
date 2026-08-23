module.exports = {
  name: 'desafio',
  description: 'Desafio do dia',
  category: 'resenha',
  aliases: [],
  async execute({ reply, reagir }) {
    await reagir('🎯')
    const items = ["Mande um áudio cantando (ou finja).","Fique 1h sem reclamar de nada.","Elogie alguém de verdade agora.","Apague 10 prints inúteis da galeria.","Beba 2 copos de água seguidos."]
    const pick = items[Math.floor(Math.random() * items.length)]
    await reply(`🎯 *Desafio do dia*\n\n${pick}`)
  }
}
