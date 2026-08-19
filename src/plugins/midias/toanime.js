const { downloadMediaMessage } = require('@whiskeysockets/baileys')
const axios = require('axios')
const FormData = require('form-data')

module.exports = {
  name: 'toanime',
  description: 'Tenta converter foto em estilo anime (API externa)',
  category: 'midias',
  aliases: ['jadianime', 'fotoanime'],
  async execute({ nyx, from, info, reply, reagir, isQuotedImage, quotedMsg }) {
    const isImage = !!info.message?.imageMessage
    if (!isImage && !isQuotedImage) {
      return reply('❗ Envie ou marque uma *foto* com o comando.')
    }

    try {
      await reagir('⏳')
      reply('🎨 Convertendo para anime... (pode demorar)')

      let mediaMsg = info
      if (isQuotedImage) {
        const qmsg = quotedMsg || info.message?.extendedTextMessage?.contextInfo?.quotedMessage ||
          info.message?.imageMessage?.contextInfo?.quotedMessage
        mediaMsg = { key: info.key, message: qmsg }
      }

      const buffer = await downloadMediaMessage(mediaMsg, 'buffer', {})

      // Tenta API pública de anime filter (pode falhar conforme disponibilidade)
      const form = new FormData()
      form.append('image', buffer, { filename: 'photo.jpg', contentType: 'image/jpeg' })

      let resultUrl = null
      try {
        const { data } = await axios.post(
          'https://api.itsrose.life/image/differentMe?style=anime',
          form,
          {
            headers: form.getHeaders(),
            timeout: 60000,
            maxContentLength: 20 * 1024 * 1024
          }
        )
        resultUrl = data?.result?.images?.[0] || data?.result || data?.url
      } catch {
        // fallback: só avisa que a API externa não está disponível
      }

      if (!resultUrl) {
        return reply(
`❌ A API de conversão anime está indisponível no momento.

💡 Alternativa: use efeitos locais:
.blur .invert .pb .espelhar .girar`
        )
      }

      await nyx.sendMessage(from, {
        image: { url: resultUrl },
        caption: '🎨 *To Anime*'
      }, { quoted: info })
      await reagir('✅')
    } catch (e) {
      reply('❌ Erro no toanime: ' + (e.message || e))
    }
  }
}
