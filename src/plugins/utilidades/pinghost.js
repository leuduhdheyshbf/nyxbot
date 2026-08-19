module.exports = {
  name: 'pinghost',
  description: 'Testa latência HTTP de uma URL',
  category: 'utilidades',
  aliases: ['latency'],
  async execute({ reply, reagir, args }) {
    const url = args[0]
    if (!url || !/^https?:\/\//i.test(url)) return reply('❗ Use: .pinghost https://exemplo.com')
    await reagir('📡')
    const axios = require('axios')
    const t = Date.now()
    try {
      await axios.get(url, { timeout: 10000, validateStatus: () => true })
      await reply(`📡 ${url}\n⏱️ ${Date.now() - t}ms`)
    } catch (e) {
      await reply(`❌ Falha: ${e.message}`)
    }
  }
}
