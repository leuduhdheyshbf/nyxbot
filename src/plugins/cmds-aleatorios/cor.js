module.exports = {
  name: 'cor',
  description: 'Cor hex aleatória',
  category: 'cmds-aleatorios',
  aliases: ['color', 'hexcolor'],
  async execute({ reply, reagir }) {
    await reagir('🎨')
    const hex = '#' + Math.floor(Math.random() * 0xffffff).toString(16).padStart(6, '0')
    await reply('🎨 Cor aleatória: *' + hex + '*')
  }
}
