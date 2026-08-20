const axios = require('axios');

// Função para remover acentos
function removerAcentos(texto) {
  return texto.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
}

module.exports = {
  name: 'clima',
  description: 'Mostra o clima com ícone oficial do tempo',
  category: 'utilidades',
  aliases: ['tempo', 'weather'],
  async execute({ columbina, from, info, args, prefix, reply }) {
    // Junta os argumentos, remove acentos e espaços extras
    let cidadeRaw = args.join(' ');
    if (!cidadeRaw) {
      return reply(`❌ Digite o nome de uma cidade.\nEx: ${prefix}clima belém - pa`);
    }

    // Remove acentos e substitui " - " por "," (formato que a API gosta)
    let cidade = removerAcentos(cidadeRaw)
    .replace(/\s+-\s+/g, ',') // transforma "belém - pa" em "belem,pa"
    .replace(/\s+/g, ' ')      // remove espaços extras
    .trim();

    const WEATHER_KEY = 'bd5e378503939ddaee76f12ad7a97608';
    const weatherUrl = `https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(cidade)}&lang=pt_br&units=metric&appid=${WEATHER_KEY}`;

    try {
      const weatherRes = await axios.get(weatherUrl);
      const data = weatherRes.data;

      const getClima = (cod) => {
        if (cod >= 200 && cod < 300) return '⛈️ Tempestade';
        if (cod >= 300 && cod < 500) return '🌧️ Chuva leve';
        if (cod >= 500 && cod < 600) return '🌧️ Chuva';
        if (cod >= 600 && cod < 700) return '❄️ Neve';
        if (cod >= 700 && cod < 800) return '🌫️ Neblina';
        if (cod === 800) return '☀️ Céu limpo';
        if (cod > 800) return '☁️ Nublado';
        return '🌤️ Clima indefinido';
      };

      const nomeCidade = data.name;
      const pais = data.sys.country;
      const descricao = data.weather[0].description;
      const emojiClima = getClima(data.weather[0].id);
      const iconCode = data.weather[0].icon;
      const iconUrl = `https://openweathermap.org/img/wn/${iconCode}@4x.png`;
      const temperatura = data.main.temp;
      const sensacao = data.main.feels_like;
      const umidade = data.main.humidity;
      const vento = data.wind.speed;
      const chuva = data.rain ? data.rain['1h'] || 0 : 0;

      const mensagem = `
      ╔══════════════════════════════╗
      ║   🌤️ *CLIMA — ${nomeCidade}* 🌤️
      ╚══════════════════════════════╝

      📍 ${nomeCidade}, ${pais}
      🌡️ ${temperatura}°C (sensação ${sensacao}°C)
      ${emojiClima} ${descricao}
      💧 Umidade: ${umidade}%
      💨 Vento: ${vento} km/h
      🌧️ Chuva: ${chuva} mm

      ▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬
      🔮 Nyx Bot • Clima
      `;

      await columbina.sendMessage(from, {
        image: { url: iconUrl },
        caption: mensagem
      }, { quoted: info });

    } catch (e) {
      console.error('[clima] Erro:', e.message);
      reply(`❌ Cidade não encontrada ou erro na API.\nTente no formato: ${prefix}clima cidade,uf (ex: ${prefix}clima belem,pa)`);
    }
  }
};
