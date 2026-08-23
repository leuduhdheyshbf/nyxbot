module.exports = {
  name: 'rpgstat',
  description: 'Gera atributos RPG aleatórios',
  category: 'jogos',
  aliases: ['ficha'],
  async execute({ reply, reagir, q }) {
    await reagir('🗡️')
    const roll = () => Math.floor(Math.random() * 16) + 3
    const nome = q || 'Aventureiro'
    await reply(`🗡️ *Ficha de ${nome}*\nFOR: ${roll()}\nDES: ${roll()}\nCON: ${roll()}\nINT: ${roll()}\nSAB: ${roll()}\nCAR: ${roll()}`)
  }
}
