module.exports = {
  name: 'nomealeatorio',
  description: 'Gera nome aleatório',
  category: 'cmds-aleatorios',
  aliases: ['randname'],
  async execute({ reply, reagir }) {
    await reagir('🪪')
    const a = ['Luna','Nyx','Kai','Aria','Raven','Sol','Vera','Noah','Iris','Leo','Maya','Orion']
    const b = ['Shadow','Frost','Night','Storm','Wolf','Blade','Moon','Ash','Vale','Cruz']
    await reply('🪪 ' + a[Math.floor(Math.random()*a.length)] + ' ' + b[Math.floor(Math.random()*b.length)])
  }
}
