module.exports = {
  name: 'motivacao',
  description: 'Motivação do dia',
  category: 'resenha',
  aliases: ["motivate"],
  async execute({ reply, reagir }) {
    await reagir('💪')
    const items = ["Você é capaz de mais do que imagina.","Um passo por vez já é progresso.","Desistir não está no script.","O caos também ensina.","Hoje é um bom dia pra vencer."]
    const pick = items[Math.floor(Math.random() * items.length)]
    await reply(`💪 *Motivação do dia*\n\n${pick}`)
  }
}
