module.exports = {
  name: 'whale',
  description: 'Fato sobre baleias (texto)',
  category: 'cmds-aleatorios',
  aliases: ['baleia'],
  async execute({ reply, reagir }) {
    await reagir('🐋')
    const fatos = [
      'A baleia-azul é o maior animal que já existiu na Terra.',
      'Baleias se comunicam com cantos que viajam quilômetros.',
      'O coração de uma baleia-azul pode pesar cerca de 180 kg.'
    ]
    await reply('🐋 ' + fatos[Math.floor(Math.random() * fatos.length)])
  }
}
