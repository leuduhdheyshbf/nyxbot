'use strict'

const yts = require('yt-search');

const RAPID_API_KEY = "6497388db0sh304dcb3481c5238p1091a7jsn85b65d43c96d";
const RAPID_API_HOST = "youtube-mp4-mp3-downloader.p.rapidapi.com";

module.exports = {
  name: 'play',
  description: 'Baixa áudio do YouTube usando a API da Opachi (RapidAPI)',
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
      if (/youtube\.com|youtu\.be/i.test(q)) {
        let videoId = null;
        if (q.includes('v=')) videoId = q.split('v=')[1]?.split('&')[0];
        else videoId = q.split('/').pop()?.split('?')[0];

        if (videoId) {
          const r = await yts({ videoId });
          video = r.videos?.[0] || (r.title ? r : null);
        }
      } else {
        const r = await yts(q);
        video = r.videos?.[0];
      }

      if (!video?.url) return reply('❌ Nada encontrado. Tente outro nome ou link.');

      await reply(`⬇️ Iniciando conversão: *${video.title || 'música'}*...`);

      // Passo 1: Disparar o download/conversão passando a URL do YouTube
      const startUrl = `https://${RAPID_API_HOST}/download?url=${encodeURIComponent(video.url)}`;
      const startRes = await fetch(startUrl, {
        method: "GET",
        headers: {
          "x-rapidapi-key": RAPID_API_KEY,
          "x-rapidapi-host": RAPID_API_HOST
        }
      });

      const startData = await startRes.json();
      console.log("[Opachi Início]:", JSON.stringify(startData, null, 2));

      const progressId = startData.progressId || startData.id;
      if (!progressId) {
        return reply('❌ A API não retornou o ID de progresso. Verifique os logs.');
      }

      // Passo 2: Fazer polling no endpoint de progresso até o arquivo ficar pronto
      let downloadUrl = null;
      const progressHost = RAPID_API_HOST; // Ajuste se o endpoint de progresso usar outro host, mas geralmente é o mesmo

      for (let i = 0; i < 15; i++) { // Tenta por até 30 segundos (a cada 2 segundos)
        await new Promise(resolve => setTimeout(resolve, 2000));

        const progUrl = `https://${progressHost}/progress?id=${progressId}`;
        const progRes = await fetch(progUrl, {
          method: "GET",
          headers: {
            "x-rapidapi-key": RAPID_API_KEY,
            "x-rapidapi-host": RAPID_API_HOST
          }
        });

        const progData = await progRes.json();
        console.log(`[Opachi Progresso Tentativa ${i + 1}]:`, JSON.stringify(progData, null, 2));

        // Procura pelo link final em várias propriedades possíveis que a API possa retornar
        if (progData.link || progData.url || progData.downloadUrl || (progData.result && progData.result.url)) {
          downloadUrl = progData.link || progData.url || progData.downloadUrl || progData.result.url;
          break;
        }
      }

      if (!downloadUrl) {
        return reply('❌ O tempo limite de conversão esgotou ou a API falhou em gerar o arquivo.');
      }

      await reply('📥 Baixando arquivo convertido para enviar...');

      const audioResponse = await fetch(downloadUrl);
      if (!audioResponse.ok) throw new Error('Falha ao baixar o arquivo gerado.');

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
          text: `🎵 *${video.title || 'Música'}*\n⏱️ ${video.timestamp || '—'}\n⚡ Processado via Opachi (RapidAPI)!`
        },
        { quoted: info }
      );

    } catch (e) {
      console.error('[play Opachi Erro]', e);
      reply(`❌ Erro ao processar: ${e.message}`);
    }
  }
};
