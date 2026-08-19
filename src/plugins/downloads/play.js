'use strict'

const yts = require('yt-search');

module.exports = {
  name: 'play',
  description: 'Baixa áudio do YouTube usando APIs Externas (Anti-Bloqueio)',
  category: 'downloads',
  aliases: ['ytmp3', 'musica', 'song'],

  async execute({ client, from, info, args, prefix, reply }) {
    const q = (args || []).join(' ').trim();
    if (!q) {
      return reply(`❗ Digite o nome ou link da música.\nEx: ${prefix || '.'}play nome da musica`);
    }

    try {
      await reply('🔎 Procurando...');

      // 1. Busca o vídeo no YouTube usando yt-search
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

      await reply(`⬇️ Baixando: *${video.title || 'música'}*...\n⏳ Aguarde um instante.`);

      // 2. Sistema de Fallback de APIs para obter o link direto do MP3
      let downloadUrl = await getAudioFromAPI(video.url);

      if (!downloadUrl) {
        return reply('❌ Nenhuma das APIs conseguiu processar o áudio no momento. Tente novamente mais tarde.');
      }

      // 3. Baixa o MP3 diretamente para a memória (Buffer) - Perfeito para o Render!
      const audioResponse = await fetch(downloadUrl);
      if (!audioResponse.ok) throw new Error('Falha ao baixar o arquivo da API.');

      const arrayBuffer = await audioResponse.arrayBuffer();
      const audioBuffer = Buffer.from(arrayBuffer);

      // Nome limpo para o arquivo
      const safeTitle = String(video.title || 'audio').replace(/[^\w\s.-]/g, '').slice(0, 60);

      // 4. Envia para o WhatsApp
      await client.sendMessage(
        from,
        {
          audio: audioBuffer,
          mimetype: 'audio/mpeg',
          fileName: `${safeTitle}.mp3`,
          ptt: false // false = envia como arquivo de áudio. true = envia como mensagem de voz
        },
        { quoted: info }
      );

      await client.sendMessage(
        from,
        {
          text: `🎵 *${video.title || 'Música'}*\n⏱️ ${video.timestamp || '—'}\n⚡ Processado via API Externa!`
        },
        { quoted: info }
      );

    } catch (e) {
      console.error('[play API]', e);
      reply(`❌ Erro interno: ${e.message}`);
    }
  }
};

// --- FUNÇÃO AUXILIAR PARA LIDAR COM AS APIS ---
async function getAudioFromAPI(videoUrl) {
  // Tentativa 1: Cobalt API (A melhor e mais rápida)
  try {
    const res = await fetch("https://api.cobalt.tools/api/json", {
      method: "POST",
      headers: {
        "Accept": "application/json",
        "Content-Type": "application/json",
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)",
                            "Origin": "https://cobalt.tools",
                            "Referer": "https://cobalt.tools/"
      },
      body: JSON.stringify({ url: videoUrl, aFormat: "mp3", isAudioOnly: true })
    });
    const data = await res.json();
    if (data && data.url) return data.url;
  } catch (e) {
    console.log("[play] Cobalt falhou, tentando fallback...");
  }

  // Tentativa 2: Ryzendesu API (Focada em bots de WhatsApp)
  try {
    const res2 = await fetch(`https://api.ryzendesu.vip/api/downloader/ytmp3?url=${encodeURIComponent(videoUrl)}`);
    const data2 = await res2.json();
    if (data2 && data2.url) return data2.url;
  } catch (e) {
    console.log("[play] Ryzendesu falhou, tentando próxima...");
  }

  // Tentativa 3: Siputzx API (Backup confiável)
  try {
    const res3 = await fetch(`https://api.siputzx.my.id/api/d/ytmp3?url=${encodeURIComponent(videoUrl)}`);
    const data3 = await res3.json();
    if (data3 && data3.data && data3.data.dl) return data3.data.dl;
  } catch (e) {
    console.log("[play] Siputzx falhou.");
  }

  return null;
}
