'use strict'

const yts = require('yt-search');

const RAPID_API_KEY = "6497388db0sh304dcb3481c5238p1091a7jsn85b65d43c96d";
const RAPID_API_HOST = "youtube-mp3-audio-video-downloader.p.rapidapi.com";

module.exports = {
  name: 'play',
  description: 'Baixa áudio do YouTube usando RapidAPI',
  category: 'downloads',
  aliases: ['ytmp3', 'musica', 'song'],

  async execute({ client, from, info, args, prefix, reply }) {
    const q = (args || []).join(' ').trim();
    if (!q) {
      return reply(`❗ Digite o nome ou link da música.\nEx: ${prefix || '.'}play nome da musica`);
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

      await reply(`⬇️ Baixando: *${video.title || 'música'}*...\n⏳ Processando via RapidAPI.`);

      // Ajustado para usar o parâmetro 'id' que a API costuma utilizar nos endpoints do painel
      const apiUrl = `https://${RAPID_API_HOST}/dl?id=${videoId}`;

      const apiResponse = await fetch(apiUrl, {
        method: "GET",
        headers: {
          "x-rapidapi-key": RAPID_API_KEY,
          "x-rapidapi-host": RAPID_API_HOST
        }
      });

      const data = await apiResponse.json();
      console.log("[RapidAPI Resposta Completa]:", JSON.stringify(data, null, 2));

      const downloadUrl = data.link || data.url || data.download || (data.result && data.result.url) || (data.data && data.data.dl);

      if (!downloadUrl) {
        return reply('❌ A API não retornou o link de download direto. Veja os logs do Render.');
      }

      const audioResponse = await fetch(downloadUrl);
      if (!audioResponse.ok) throw new Error('Falha ao baixar o arquivo da URL gerada.');

      const arrayBuffer = await audioResponse.arrayBuffer();
      const audioBuffer = Buffer.from(arrayBuffer);

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
          text: `🎵 *${video.title || 'Música'}*\n⏱️ ${video.timestamp || '—'}\n⚡ Processado via RapidAPI!`
        },
        { quoted: info }
      );

    } catch (e) {
      console.error('[play RapidAPI Erro]', e);
      reply(`❌ Erro ao processar: ${e.message}`);
    }
  }
};
