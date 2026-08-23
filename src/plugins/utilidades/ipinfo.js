module.exports = {
  name: 'ipinfo',
  description: 'Info básica de um IP público',
  category: 'utilidades',
  aliases: ['ip'],
  async execute({ reply, reagir, args }) {
    const ip = args[0]
    if (!ip) return reply('❗ Use: .ipinfo 8.8.8.8')
    await reagir('🌐')
    try {
      const axios = require('axios')
      const { data } = await axios.get(`https://ipapi.co/${ip}/json/`, { timeout: 10000 })
      if (data.error) return reply('❌ ' + (data.reason || 'IP inválido'))
      await reply(`🌐 *${data.ip}*\n🏙 ${data.city || '—'} / ${data.region || '—'}\n🌍 ${data.country_name || '—'}\n🏢 ${data.org || '—'}`)
    } catch (e) {
      await reply('❌ ' + e.message)
    }
  }
}
