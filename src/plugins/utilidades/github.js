module.exports = {
  name: 'github',
  description: 'Info de usuário do GitHub',
  category: 'utilidades',
  aliases: ['gh'],
  async execute({ reply, reagir, args }) {
    const user = args[0]
    if (!user) return reply('❗ Use: .github torvalds')
    await reagir('🐙')
    try {
      const axios = require('axios')
      const { data } = await axios.get(`https://api.github.com/users/${user}`, { timeout: 10000 })
      await reply(`🐙 *${data.login}*\n👤 ${data.name || '—'}\n📝 ${data.bio || '—'}\n📦 Repos: ${data.public_repos}\n👥 Followers: ${data.followers}\n🔗 ${data.html_url}`)
    } catch {
      await reply('❌ Usuário não encontrado.')
    }
  }
}
