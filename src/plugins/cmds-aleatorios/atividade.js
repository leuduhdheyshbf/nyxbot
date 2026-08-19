module.exports = {
  name: 'atividade',
  description: 'Sugestão de atividade',
  category: 'cmds-aleatorios',
  aliases: ['oquefazer'],
  async execute({ reply, reagir }) {
    await reagir('🎯')
    const list = [
      'Caminhar 15 minutos',
      'Ouvir um álbum inteiro',
      'Escrever 5 linhas de diário',
      'Limpar a mesa',
      'Aprender 3 palavras em outro idioma',
      'Fazer alongamento',
      'Cozinhar algo simples'
    ]
    await reply('🎯 ' + list[Math.floor(Math.random() * list.length)])
  }
}
