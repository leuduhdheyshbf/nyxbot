module.exports = {
  name: 'verdade2',
  description: 'Verdade inconveniente',
  category: 'resenha',
  aliases: [],
  async execute({ reply, reagir }) {
    await reagir('🪞')
    const items = ["Todo mundo finge que lê os termos de uso.","A maioria dos planos morre na preguiça.","Você já julgou alguém pelo print errado.","O “tô chegando” às vezes é mentira.","Seu eu do passado também errava feio."]
    const pick = items[Math.floor(Math.random() * items.length)]
    await reply(`🪞 *Verdade inconveniente*\n\n${pick}`)
  }
}
