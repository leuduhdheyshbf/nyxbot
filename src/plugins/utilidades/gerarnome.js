module.exports = {
  name: 'gerarnome',
  description: 'Gera nomes aleatórios',
  category: 'utilidades',
  aliases: ['nome', 'nick'],
  async execute({ reply, reagir }) {
    await reagir('🎲')
    const a = ['Dark', 'Shadow', 'Fire', 'Ice', 'Storm', 'Night', 'Cyber', 'Neo', 'Ultra', 'Mega', 'Super', 'Alpha']
    const b = ['Wolf', 'Fox', 'Dragon', 'Ninja', 'Hunter', 'King', 'Ghost', 'Blade', 'Strike', 'Master', 'Pro', 'X']
    const nomes = []
    for (let i = 0; i < 5; i++) {
      nomes.push(a[Math.floor(Math.random() * a.length)] + b[Math.floor(Math.random() * b.length)] + Math.floor(Math.random() * 99))
    }
    reply(`🎲 *Nomes gerados*\n\n${nomes.map((n, i) => `${i + 1}. ${n}`).join('\n')}`)
  }
}
