module.exports = {
  name: 'loteria',
  description: 'Loteria',
  category: 'resenha',
  aliases: ['lotofacil', 'mega'],
  async execute({ reply, args }) {
    const numeros = args.length > 0 ? args.join(' ').split(',').map(n => parseInt(n.trim())).filter(n => !isNaN(n)) : []

    if (numeros.length > 0) {
      const sorteados = Array.from({ length: 6 }, () => Math.floor(Math.random() * 60) + 1).sort((a, b) => a - b)
      const acertos = numeros.filter(n => sorteados.includes(n))

      let texto = '🎰 *LOTERIA*\n\n'
      texto += `Seus números: ${numeros.join(', ')}\n`
      texto += `Sorteados: ${sorteados.join(', ')}\n\n`
      texto += `Acertos: ${acertos.length}\n`

      if (acertos.length === 6) {
        texto += '🎉 *MEGA SENA! Você ganhou!* 🎉'
      } else if (acertos.length >= 4) {
        texto += '🎯 *Quase lá! Tente novamente!*'
      } else {
        texto += '😔 *Tente novamente!*'
      }

      reply(texto)
    } else {
      reply(`🎰 *LOTERIA*\n\nEscolha 6 números de 1 a 60\nUse: !loteria 5,12,23,34,45,56`)
    }
  }
}
