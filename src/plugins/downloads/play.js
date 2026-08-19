'use strict'

const yts = require('yt-search');
const axios = require('axios');

// Lê a chave do ambiente (Render) ou usa fallback
const RAPID_API_KEY = process.env.RAPIDAPI_KEY || process.env.RAPID_API_KEY || "6497388db0sh304dcb3481c5238p1091a7jsn85b65d43c96d";
const RAPID_API_HOST = "youtube-mp4-mp3-downloader.p.rapidapi.com";
const BASE_URL = `https://${RAPID_API_HOST}/api/v1`;

module.exports = {
  name: 'play',
  description: 'Baixa áudio do YouTube usando a API da Opachi com Axios',
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
      let videoId = null;

      if (/youtube\.com|youtu\.be/i.test(q)) {
        if (q.includes('v=')) videoId = q.split('v=')[1]?.split('&')[0];
        else videoId = q.split('/').pop()?.split('?')[0];

        if (videoId) {
          const r = await yts({ videoId });
          video = r.videos?.[0] || (r.title ? r : null);
        }
      } else {
        const r = await yts(q);
        video = r.videos?.[0];
        if (video?.url) {
          if (video.url.includes('v=')) videoId = video.url.split('v=')[1]?.split('&')[0];
          else videoId = video.url.split('/').pop()?.split('?')[0];
        }
      }

      if (!video?.url || !videoId) return reply('❌ Nada encontrado. Tente outro nome ou link.');

      await reply(`⬇️ Iniciando conversão: *${video.title || 'música'}*...`);

      const options = {
        headers: {
          'x-rapidapi-key': RAPID_API_KEY,
          'x-rapidapi-host': RAPID_API_HOST
        }
      };

      // 1. Iniciar o processo de download
      const startRes = await axios.get(`${BASE_URL}/download?id=${videoId}&format=mp3`, options);
      const progressId = startRes.data.id || startRes.data.progressId;

      if (!progressId) {
        return reply('❌ A API não retornou o ID de progresso.');
      }

      // 2. Loop para verificar o progresso
      let downloadUrl = null;
      let attempts = 0;
      const maxAttempts = 15; // ~45 segundos

      while (!downloadUrl && attempts < maxAttempts) {
        attempts++;
        await new Promise(resolve => setTimeout(resolve, 3000));

        const progressRes = await axios.get(`${BASE_URL}/progress?id=${progressId}`, options);
        const status = progressRes.data;

        console.log(`[Opachi Tentativa ${attempts}]:`, status);

        if (status.status === 'completed' || status.downloadUrl || status.link || status.url) {
          downloadUrl = status.downloadUrl || status.link || status.url || (status.result && status.result.url);
          break;
        } else if (status.status === 'error') {
          throw new Error("Erro no processamento da API.");
        }
      }

      if (!downloadUrl) {
        return reply('❌ O tempo limite de conversão esgotou.');
      }

      await reply('📥 Baixando arquivo convertido para enviar...');

      const audioResponse = await axios.get(downloadUrl, { responseType: 'arraybuffer' });
      const audioBuffer = Buffer.from(audioResponse.data);

      const safeTitle = String(video.title || 'audio').replace(/[^\w\s.-]/g, '').slice(0, 60);

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
          text: `🎵 *${video.title || 'Música'}*\n⏱️ ${video.timestamp || '—'}\n⚡ Processado via Opachi & Axios!`
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
