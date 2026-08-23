module.exports = {
  name: 'adivinhacao',
  description: 'Adivinhe o que pensei',
  category: 'resenha',
  aliases: ['telepatia', 'mente'],
  async execute({ reply }) {
    const pensamentos = ['cachorro', 'gato', 'amor', 'felicidade', 'sol', 'lua', 'estrela', 'futebol', 'música', 'comida']
    const pensamento = pensamentos[Math.floor(Math.random() * pensamentos.length)]
    await reply(`🧠 *Pensei em:* ${pensamento}`)
  }
}
