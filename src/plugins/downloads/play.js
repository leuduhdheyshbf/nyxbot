'use strict';

const yts = require('yt-search');
const axios = require('axios');

// ============================================================
// RAPIDAPI
// ============================================================

// Host público da API — pode ficar no código.
const RAPID_API_HOST =
process.env.RAPIDAPI_HOST ||
'youtube-mp4-mp3-downloader.p.rapidapi.com';

// Chave privada — coloque somente nas Environment Variables
// do Cloud/Render como RAPIDAPI_KEY.
const RAPID_API_KEY =
process.env.RAPIDAPI_KEY;

const BASE_URL =
`https://${RAPID_API_HOST}/api/v1`;

// ============================================================
// COMANDO
// ============================================================

module.exports = {
  name: 'play',

  description:
  'Baixa áudio do YouTube usando a API da Opachi com Axios',

  category: 'downloads',

  aliases: [
    'ytmp3',
    'musica',
    'song'
  ],

  async execute({
    client,
    from,
    info,
    args,
    prefix,
    reply
  }) {

    const q = (args || [])
    .join(' ')
    .trim();

    if (!q) {
      return reply(
        `❗ Digite o nome ou link da música.\n` +
        `Ex: ${prefix || '.'}play nome da musica`
      );
    }

    // ========================================================
    // VERIFICAR CHAVE
    // ========================================================

    if (
      !RAPID_API_KEY ||
      RAPID_API_KEY.length < 20
    ) {
      return reply(
        '❌ Chave da RapidAPI não configurada. ' +
        'Defina RAPIDAPI_KEY nas variáveis de ambiente.'
      );
    }

    try {

      // ======================================================
      // BUSCAR MÚSICA
      // ======================================================

      await reply('🔎 Procurando...');

      let video;
      let videoId = null;

      // ======================================================
      // LINK DO YOUTUBE
      // ======================================================

      if (/youtube\.com|youtu\.be/i.test(q)) {

        if (q.includes('v=')) {
          videoId =
          q
          .split('v=')[1]
          ?.split('&')[0];
        } else {
          videoId =
          q
          .split('/')
          .pop()
          ?.split('?')[0];
        }

        if (videoId) {

          const r =
          await yts({ videoId });

          video =
          r.videos?.[0] ||
          (r.title ? r : null);
        }

        // ======================================================
        // PESQUISA
        // ======================================================

      } else {

        const r =
        await yts(q);

        video =
        r.videos?.[0];

        if (video?.url) {

          if (video.url.includes('v=')) {

            videoId =
            video.url
            .split('v=')[1]
            ?.split('&')[0];

          } else {

            videoId =
            video.url
            .split('/')
            .pop()
            ?.split('?')[0];
          }
        }
      }

      // ======================================================
      // VALIDAR VÍDEO
      // ======================================================

      if (!video?.url || !videoId) {
        return reply(
          '❌ Nada encontrado. Tente outro nome ou link.'
        );
      }

      await reply(
        `⬇️ Iniciando conversão: ` +
        `*${video.title || 'música'}*...`
      );

      // ======================================================
      // HEADERS RAPIDAPI
      // ======================================================

      const options = {
        headers: {
          'x-rapidapi-key': RAPID_API_KEY,
          'x-rapidapi-host': RAPID_API_HOST
        }
      };

      // ======================================================
      // 1. INICIAR CONVERSÃO
      // ======================================================

      const startRes =
      await axios.get(
        `${BASE_URL}/download` +
        `?id=${encodeURIComponent(videoId)}` +
        `&format=mp3`,
        {
          ...options,
          timeout: 20_000
        }
      );

      const progressId =
      startRes.data?.id ||
      startRes.data?.progressId;

      if (!progressId) {

        console.error(
          '[Opachi] API não retornou progressId:',
          startRes.data
        );

        return reply(
          '❌ A API não retornou o ID de progresso.'
        );
      }

      console.log(
        '[Opachi] Conversão iniciada:',
        progressId
      );

      // ======================================================
      // 2. POLLING
      // ======================================================

      let downloadUrl = null;

      // Até 90 segundos aguardando a conversão.
      const maxWaitMs = 90_000;

      // Consulta a cada 4 segundos.
      const pollIntervalMs = 4_000;

      const startedAt =
      Date.now();

      while (
        Date.now() - startedAt < maxWaitMs
      ) {

        try {

          const progressRes =
          await axios.get(
            `${BASE_URL}/progress` +
            `?id=${encodeURIComponent(progressId)}`,
                          {
                            ...options,
                            timeout: 15_000
                          }
          );

          const status =
          progressRes.data || {};

          // ==================================================
          // LOCALIZAR URL
          // ==================================================

          const candidateUrl =
          status.downloadUrl ||
          status.link ||
          status.url ||
          status.result?.url ||
          null;

          // ==================================================
          // LOG LIMPO
          // ==================================================

          console.log(
            '[Opachi]',
            {
              status:
              status.status || 'unknown',

              progress:
              status.progress ?? null,

              finished:
              status.finished ?? false
            }
          );

          // ==================================================
          // FINALIZADO
          // ==================================================

          if (
            status.finished === true &&
            candidateUrl &&
            typeof candidateUrl === 'string' &&
            /^https?:\/\//i.test(candidateUrl)
          ) {

            downloadUrl =
            candidateUrl;

            console.log(
              '[Opachi] Download pronto.'
            );

            break;
          }

          // ==================================================
          // COMPATIBILIDADE COM OUTROS STATUS
          // ==================================================

          if (
            candidateUrl &&
            typeof candidateUrl === 'string' &&
            /^https?:\/\//i.test(candidateUrl) &&
            (
              status.status === 'completed' ||
              status.status === 'finished' ||
              status.status === 'Finished'
            )
          ) {

            downloadUrl =
            candidateUrl;

            console.log(
              '[Opachi] Download pronto.'
            );

            break;
          }

          // ==================================================
          // ERRO REAL
          // ==================================================

          if (
            status.status === 'error' ||
            status.status === 'failed' ||
            status.status === 'failure'
          ) {

            throw new Error(
              status.message ||
              'Erro no processamento da API.'
            );
          }

          // ==================================================
          // AINDA PROCESSANDO
          // ==================================================

          await new Promise(
            resolve =>
            setTimeout(
              resolve,
              pollIntervalMs
            )
          );

        } catch (err) {

          // ==================================================
          // ERROS TEMPORÁRIOS
          // ==================================================

          if (
            err.code === 'ECONNABORTED' ||
            err.code === 'ETIMEDOUT' ||
            err.code === 'ECONNRESET' ||
            err.response?.status >= 500
          ) {

            console.warn(
              '[Opachi] Falha temporária:',
              err.code ||
              err.response?.status
            );

            await new Promise(
              resolve =>
              setTimeout(
                resolve,
                pollIntervalMs
              )
            );

            continue;
          }

          throw err;
        }
      }

      // ======================================================
      // TIMEOUT
      // ======================================================

      if (!downloadUrl) {

        console.warn(
          '[Opachi] Timeout:',
          progressId
        );

        return reply(
          '❌ A conversão demorou mais que o esperado. ' +
          'Tente novamente.'
        );
      }

      // ======================================================
      // 3. BAIXAR MP3
      // ======================================================

      await reply(
        '📥 Baixando arquivo convertido para enviar...'
      );

      const audioResponse =
      await axios.get(
        downloadUrl,
        {
          responseType:
          'arraybuffer',

          timeout:
          120_000,

          maxContentLength:
          50 * 1024 * 1024,

          maxBodyLength:
          50 * 1024 * 1024
        }
      );

      const audioBuffer =
      Buffer.from(
        audioResponse.data
      );

      if (!audioBuffer.length) {
        throw new Error(
          'A API retornou um arquivo vazio.'
        );
      }

      // ======================================================
      // 4. NOME DO ARQUIVO
      // ======================================================

      const safeTitle =
      String(
        video.title || 'audio'
      )
      .replace(
        /[^\w\s.-]/g,
        ''
      )
      .slice(0, 60)
      .trim() ||
      'audio';

        // ======================================================
        // 5. ENVIAR ÁUDIO
        // ======================================================

        await client.sendMessage(
          from,
          {
            audio:
            audioBuffer,

            mimetype:
            'audio/mpeg',

            fileName:
            `${safeTitle}.mp3`,

            ptt:
            false
          },
          {
            quoted:
            info
          }
        );

        // ======================================================
        // 6. MENSAGEM FINAL
        // ======================================================

        await client.sendMessage(
          from,
          {
            text:
            `🎵 *${video.title || 'Música'}*\n` +
            `⏱️ ${video.timestamp || '—'}\n` +
            `⚡ Processado via Opachi & Axios!`
          },
          {
            quoted:
            info
          }
        );

    } catch (e) {

      console.error(
        '[play Axios Erro]',
        e?.response?.data ||
        e.message
      );

      const msg =
      e?.response?.data?.message ||
      e.message ||
      'Erro desconhecido';

            return reply(
              `❌ Erro ao processar: ${msg}`
            );
    }
  }
};
