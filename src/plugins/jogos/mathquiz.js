module.exports = {
  name: 'mathquiz',
  description: 'Continha rápida (mostra resposta)',
  category: 'jogos',
  aliases: ['conta'],
  async execute({ reply, reagir }) {
    await reagir('🧮')
    const a = Math.floor(Math.random() * 20) + 1
    const b = Math.floor(Math.random() * 20) + 1
    const ops = ['+', '-', '*']
    const op = ops[Math.floor(Math.random() * ops.length)]
    const r = op === '+' ? a + b : op === '-' ? a - b : a * b
    await reply(`🧮 Quanto é ${a} ${op} ${b}?\nResposta: *${r}*`)
  }
}
