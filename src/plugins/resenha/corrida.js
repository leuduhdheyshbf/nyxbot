module.exports = {
  name: 'corrida',
  description: 'Corrida de carros',
  category: 'resenha',
  aliases: ['race', 'correr'],
  async execute({ reply }) {
    const carros = ['🚗', '🚕', '🚙', '🏎️', '🚓', '🚑']
    const carro1 = carros[Math.floor(Math.random() * carros.length)]
    const carro2 = carros[Math.floor(Math.random() * carros.length)]

    let dist1 = 0, dist2 = 0

    for (let i = 0; i < 15; i++) {
      dist1 += Math.floor(Math.random() * 3) + 1
      dist2 += Math.floor(Math.random() * 3) + 1
    }

    const bar1 = '🏁'.repeat(Math.min(dist1, 15))
    const bar2 = '🏁'.repeat(Math.min(dist2, 15))

    const vencedor = dist1 > dist2 ? '🏆 Carro 1' : dist1 < dist2 ? '🏆 Carro 2' : '🤝 Empate!'

    reply(`🏎️ *CORRIDA*\n\n${carro1} Carro 1: ${bar1} ${dist1}m\n${carro2} Carro 2: ${bar2} ${dist2}m\n\nVencedor: ${vencedor}`)
  }
}
