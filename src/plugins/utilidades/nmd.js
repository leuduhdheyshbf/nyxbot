module.exports = {
  name: 'nmd',
  description: 'Número aleatório no intervalo',
  category: 'utilidades',
  aliases: ['randomnum', 'rand'],
  async execute({ reply, args }) {
    let min = parseInt(args[0], 10)
    let max = parseInt(args[1], 10)
    if (isNaN(min)) { min = 1; max = 100 }
    if (isNaN(max)) { max = min; min = 1 }
    if (min > max) [min, max] = [max, min]
    const n = Math.floor(Math.random() * (max - min + 1)) + min
    await reply(`🎲 Número entre ${min} e ${max}: *${n}*`)
  }
}
