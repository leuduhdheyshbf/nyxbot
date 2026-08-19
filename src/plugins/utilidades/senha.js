module.exports = {
  name: 'senha',
  description: 'Gera senha aleatória',
  category: 'utilidades',
  aliases: ['password', 'gerarsenha'],
  async execute({ reply, reagir, args }) {
    const len = Math.min(Math.max(parseInt(args[0]) || 12, 6), 32)
    await reagir('🔐')
    const chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%'
    let s = ''
    for (let i=0;i<len;i++) s += chars[Math.floor(Math.random()*chars.length)]
    reply(`🔐 *Senha gerada (${len}):*\n\`${s}\``)
  }
}
