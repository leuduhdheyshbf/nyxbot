module.exports = {
  name: 'piadaruim',
  description: 'Piada ruim',
  category: 'resenha',
  aliases: [],
  async execute({ reply, reagir }) {
    await reagir('🤦')
    const items = ["Por que o livro de matemática está triste? Porque tem muitos problemas.","O que o zero disse para o oito? Belo cinto!","Por que o computador foi ao médico? Porque pegou vírus.","Qual o contrário de volátil? Vem cá sobrinho.","Não sou preguiçoso, estou em modo economia de energia."]
    const pick = items[Math.floor(Math.random() * items.length)]
    await reply(`🤦 *Piada ruim*\n\n${pick}`)
  }
}
