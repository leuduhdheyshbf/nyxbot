const axios = require('axios')
module.exports = {
  name: 'clima',
  description: 'Clima da cidade',
  category: 'utilidades',
  aliases: ['tempo', 'weather'],
  async execute({ reply, reagir, q }) {
    if (!q) return reply('❗ Use: .clima São Paulo')
    try {
      await reagir('🌤️')
      const city = q.trim()
      const { data } = await axios.get(
        `https://wttr.in/${encodeURIComponent(city)}?format=j1&lang=pt`,
        { timeout: 12000, headers: { 'User-Agent': 'NyxBot' } }
      )
      const cur = data.current_condition?.[0]
      const area = data.nearest_area?.[0]
      if (!cur) return reply('❌ Cidade não encontrada.')
      const nome = area?.areaName?.[0]?.value || city
      const reg = area?.region?.[0]?.value || ''
      const pais = area?.country?.[0]?.value || ''
      const desc = cur.lang_pt?.[0]?.value || cur.weatherDesc?.[0]?.value || ''
      reply(
`🌤️ *Clima — ${nome}*
📍 ${reg}${reg && pais ? ', ' : ''}${pais}
🌡️ ${cur.temp_C}°C (sensação ${cur.FeelsLikeC}°C)
☁️ ${desc}
💧 Umidade: ${cur.humidity}%
💨 Vento: ${cur.windspeedKmph} km/h
🌧️ Chuva: ${cur.precipMM} mm`
      )
    } catch (e) {
      console.error(e)
      reply('❌ Erro ao buscar clima.')
    }
  }
}
