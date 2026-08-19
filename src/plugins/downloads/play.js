'use strict';

const yts = require('yt-search');
const axios = require('axios');

// Lê a chave do ambiente (Render) ou usa fallback
const RAPID_API_KEY = process.env.RAPIDAPI_KEY || process.env.RAPID_API_KEY || "6497388db0sh304dcb3481c5238p1091a7jsn85b65d43c96d";
const RAPID_API_HOST = "youtube-mp310.p.rapidapi.com";
const BASE_URL = `https://${RAPID_API_HOST}`;

module.exports = {
  name: 'play',
  description: 'Baixa áudio do YouTube usando a API RapidAPI (youtube-mp310)',
  category: 'downloads',
  aliases: ['ytmp3', 'musica', 'song'],

  async execute({ client, from, info, args, prefix, reply }) {
    const q = (args || []).join(' ').trim();
    if (!q) {
      return reply(`❗ Digite o nome ou link da música.\nEx: ${prefix || '.'}play nome da musica`);
    }

    if (!RAPID_API_KEY || RAPID_API_KEY.length < 20) {
      return reply('❌ Chave da RapidAPI não configurada. Defina RAPIDAPI_KEY no ambiente.');
    }

    try {
      await reply('🔎 Procurando...');

      let video;
      let videoUrl = null;

      if (/youtube\.com|youtu\.be/i.test(q)) {
        let videoId = null;
        if (q.includes('v=')) videoId = q.split('v=')[1]?.split('&')[0];
        else videoId = q.split('/').pop()?.split('?')[0];

        if (videoId) {
          const r = await yts({ videoId });
          video = r.videos?.[0] || (r.title ? r : null);
          videoUrl = video?.url || q;
        } else {
          videoUrl = q;
          const r = await yts(q);
          video = r.videos?.[0];
        }
      } else {
        const r = await yts(q);
        video = r.videos?.[0];
        videoUrl = video?.url;
      }

      if (!videoUrl) return reply('❌ Nada encontrado. Tente outro nome ou link.');

      await reply(`⬇️ Baixando conversão: *${video?.title || 'música'}*...`);

      const options = {
        method: 'GET',
        url: `${BASE_URL}/download/mp3`,
        params: { url: videoUrl },
        headers: {
          'x-rapidapi-key': RAPID_API_KEY,
          'x-rapidapi-host': RAPID_API_HOST
        }
      };

      // Requisição direta para a nova API
      const response = await axios.request(options);
      const data = response.data;

      // Extrai o link de download direto retornado pela API
      const downloadUrl = data.link || data.download || data.url || (data.result && data.result.url);

      if (!downloadUrl) {
        return reply('❌ A API não retornou o link de download direto.');
      }

      await reply('📥 Baixando arquivo convertido para enviar...');

      const audioResponse = await axios.get(downloadUrl, { responseType: 'arraybuffer' });
      const audioBuffer = Buffer.from(audioResponse.data);

      const safeTitle = String(video?.title || 'audio').replace(/[^\w\s.-]/g, '').slice(0, 60);

      await client.sendMessage(
        from,
        {
          audio: audioBuffer,
          mimetype: 'audio/mpeg',
          fileName: `${safeTitle}.mp3`,
          ptt: false
        },
        { quoted: info }
      );

      await client.sendMessage(
        from,
        {
          text: `🎵 *${video?.title || 'Música'}*\n⏱️ ${video?.timestamp || '—'}\n⚡ Processado via YouTube MP3 (RapidAPI)!`
        },
        { quoted: info }
      );

    } catch (e) {
      console.error('[play Axios Erro]', e?.response?.data || e.message);
      const msg = e?.response?.data?.message || e.message || 'Erro desconhecido';
      reply(`❌ Erro ao processar: ${msg}`);
    }
  }
};
