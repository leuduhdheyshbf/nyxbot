module.exports = {
  name: 'elogio',
  description: 'Elogio aleatório',
  category: 'resenha',
  aliases: [],
  async execute({ reply, reagir }) {
    await reagir('🌟')
    const items = ["Você tem uma energia boa demais.","Seu humor salva conversas mortas.","Tem potencial de chefão silencioso.","Sua presença melhora o grupo.","Você é raro no melhor sentido."]
    const pick = items[Math.floor(Math.random() * items.length)]
    await reply(`🌟 *Elogio aleatório*\n\n${pick}`)
  }
}
