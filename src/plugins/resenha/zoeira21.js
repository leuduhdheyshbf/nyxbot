module.exports = {
  name: 'zoeira21',
  description: 'Zoeira aleatória #21',
  category: 'resenha',
  aliases: [],
  async execute({ reply, reagir }) {
    await reagir('🦇')
    const lines = [
      'O grupo ficou em silêncio constrangedor.',
      'Alguém derrubou o clima sem querer.',
      'Plot twist: ninguém esperava isso.',
      'Modo caos ativado.',
      'Isso foi estranhamente genial.',
      'Arquivado em memórias dúbias.',
      'O universo piscou pra você.',
      'Missão cumprida. Ou não.'
    ]
    await reply('🦇 #' + 21 + ' ' + lines[Math.floor(Math.random() * lines.length)])
  }
}
