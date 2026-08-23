module.exports = {
  name: 'fato2',
  description: 'Fato curioso',
  category: 'resenha',
  aliases: [],
  async execute({ reply, reagir }) {
    await reagir('📚')
    const items = ["Polvos têm três corações.","O mel nunca estraga.","Bananas são bagas, morangos não.","Um dia em Vênus dura mais que um ano.","Tubarões existem há mais tempo que árvores."]
    const pick = items[Math.floor(Math.random() * items.length)]
    await reply(`📚 *Fato curioso*\n\n${pick}`)
  }
}
