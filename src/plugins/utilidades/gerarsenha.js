module.exports = {
  name: 'gerarsenha',
  description: 'Gera senha aleatória',
  category: 'utilidades',
  aliases: ['password', 'gensenha'],
  async execute({ reply, reagir, args }) {
    await reagir('🔐')
    const len = Math.min(64, Math.max(6, parseInt(args[0], 10) || 12))
    const chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%&*'
    let s = ''
    for (let i = 0; i < len; i++) s += chars[Math.floor(Math.random() * chars.length)]
    await reply(`🔐 Senha (${len}): \`${s}\``)
  }
}
