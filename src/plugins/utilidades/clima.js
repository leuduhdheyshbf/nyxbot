'use strict'

/**
 * .clima [cidade] — clima + foto da cidade
 *
 * Variáveis de ambiente no Render:
 *   WEATHER_API_KEY   → OpenWeatherMap  (https://openweathermap.org/api)
 *   UNSPLASH_API_KEY  → Unsplash        (https://unsplash.com/developers)
 *
 * No Render: Dashboard → Environment → Add Environment Variable
 */

const axios = require('axios')

// Emojis por código OpenWeather (main / id)
function weatherEmoji(weather) {
  if (!weather) return '🌤️'
  const id = weather.id || 0
  const main = (weather.main || '').toLowerCase()

  if (id >= 200 && id < 300) return '⛈️'
  if (id >= 300 && id < 400) return '🌦️'
  if (id >= 500 && id < 600) return '🌧️'
  if (id >= 600 && id < 700) return '❄️'
  if (id >= 700 && id < 800) return '🌫️'
  if (id === 800) return '☀️'
  if (id === 801 || id === 802) return '⛅'
  if (id >= 803) return '☁️'

  if (main.includes('thunder')) return '⛈️'
  if (main.includes('rain') || main.includes('drizzle')) return '🌧️'
  if (main.includes('snow')) return '❄️'
  if (main.includes('clear')) return '☀️'
  if (main.includes('cloud')) return '☁️'
  return '🌤️'
}

module.exports = {
  name: 'clima',
  description: 'Mostra o clima com imagem da cidade',
  category: 'utilidades',
  aliases: ['tempo', 'weather'],

  async execute({ columbina, nyx, client, sock, from, info, args, prefix, reply }) {
    const bot = columbina || nyx || client || sock
    const cidade = (args || []).join(' ').trim()

    if (!cidade) {
      return reply(
        `🌤️ *Uso:* \`${prefix}clima [cidade]\`\n\n` +
          `Exemplos:\n` +
          `▸ \`${prefix}clima São Paulo\`\n` +
          `▸ \`${prefix}clima Rio de Janeiro\`\n` +
          `▸ \`${prefix}clima London\``
      )
    }

    const weatherKey = process.env.WEATHER_API_KEY || process.env.OPENWEATHER_API_KEY
    const unsplashKey = process.env.UNSPLASH_API_KEY || process.env.UNSPLASH_ACCESS_KEY

    if (!weatherKey) {
      return reply(
        '❌ *WEATHER_API_KEY* não configurada.\n\n' +
          'No Render: Environment → WEATHER_API_KEY\n' +
          'Obtenha em: https://openweathermap.org/api'
      )
    }

    try {
      // ---------- 1. Clima (OpenWeatherMap) ----------
      const weatherUrl =
        'https://api.openweathermap.org/data/2.5/weather' +
        `?q=${encodeURIComponent(cidade)}` +
        `&appid=${weatherKey}` +
        `&units=metric&lang=pt_br`

      const { data: w } = await axios.get(weatherUrl, { timeout: 12000 })

      const nome = w.name || cidade
      const pais = (w.sys && w.sys.country) || ''
      const temp = Math.round(w.main.temp)
      const feels = Math.round(w.main.feels_like)
      const umidade = w.main.humidity
      const vento = (w.wind && w.wind.speed != null) ? Number(w.wind.speed).toFixed(1) : '?'
      const descricao = (w.weather && w.weather[0] && w.weather[0].description) || '—'
      const emoji = weatherEmoji(w.weather && w.weather[0])

      // Chance de chuva: volume na última 1h/3h se existir, senão "—"
      let chuvaTxt = '—'
      if (w.rain) {
        const mm = w.rain['1h'] ?? w.rain['3h']
        if (mm != null) chuvaTxt = `${mm} mm`
      } else if (w.pop != null) {
        chuvaTxt = `${Math.round(w.pop * 100)}%`
      }

      const legenda =
        `${emoji} *${nome}${pais ? `, ${pais}` : ''}*\n\n` +
        `🌡️ Temperatura: *${temp}°C*\n` +
        `🤒 Sensação: *${feels}°C*\n` +
        `📋 Clima: *${descricao}*\n\n` +
        `💧 Umidade: *${umidade}%*\n` +
        `💨 Vento: *${vento} m/s*\n` +
        `🌧️ Chuva: *${chuvaTxt}*\n\n` +
        `🔮 Nyx Bot • Clima`

      // ---------- 2. Imagem da cidade (Unsplash) ----------
      let imageUrl = null

      if (unsplashKey) {
        try {
          const unsplashUrl =
            'https://api.unsplash.com/search/photos' +
            `?query=${encodeURIComponent(nome + ' city')}` +
            `&per_page=1&orientation=landscape`

          const { data: u } = await axios.get(unsplashUrl, {
            timeout: 10000,
            headers: { Authorization: `Client-ID ${unsplashKey}` }
          })

          if (u.results && u.results[0] && u.results[0].urls) {
            imageUrl = u.results[0].urls.regular || u.results[0].urls.small
          }
        } catch {
          // sem imagem — segue só com texto
        }
      }

      // Fallback visual se Unsplash falhar / sem chave
      if (!imageUrl) {
        // OpenWeather icon (sempre disponível)
        const icon = w.weather && w.weather[0] && w.weather[0].icon
        if (icon) {
          imageUrl = `https://openweathermap.org/img/wn/${icon}@4x.png`
        }
      }

      // ---------- 3. Enviar ----------
      if (imageUrl) {
        await bot.sendMessage(
          from,
          {
            image: { url: imageUrl },
            caption: legenda
          },
          { quoted: info }
        )
      } else {
        await reply(legenda)
      }
    } catch (err) {
      const status = err.response && err.response.status
      const apiMsg =
        err.response && err.response.data && (err.response.data.message || err.response.data.cod)

      if (status === 404 || apiMsg === 'city not found') {
        return reply(`❌ Cidade *"${cidade}"* não encontrada.\nTente outro nome ou em inglês.`)
      }
      if (status === 401) {
        return reply('❌ Chave da OpenWeatherMap inválida. Verifique WEATHER_API_KEY no Render.')
      }

      console.error('[clima]', err.message)
      return reply('❌ Erro ao buscar o clima. Tente novamente em instantes.')
    }
  }
}
