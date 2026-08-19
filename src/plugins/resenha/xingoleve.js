module.exports = {
  name: 'xingoleve',
  description: 'Xingamento leve (zoeira)',
  category: 'resenha',
  aliases: ["xingo"],
  async execute({ reply, reagir }) {
    await reagir('😤')
    const items = ["Seu cérebro pediu férias e não voltou.","Você é a prova de que o CTRL+Z não funciona na vida.","Parabéns, você bugou o senso comum.","Se fosse arquivo, estaria na lixeira.","Seu carregador social está em 1%."]
    const pick = items[Math.floor(Math.random() * items.length)]
    await reply(`😤 *Xingamento leve (zoeira)*\n\n${pick}`)
  }
}
