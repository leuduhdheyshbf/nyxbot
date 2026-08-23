const { downloadMediaMessage } = require('@whiskeysockets/baileys')
// [NyxFix] require de exif2.js removido (não existe na V2)
const fs = require('fs')

module.exports = {
  name: 'sc',
  description: 'Figurinha circular ou rouba figurinha marcada',
  category: 'cmds-aleatorios',
  aliases: ['circulo', 'circular'],
  async execute({ nyx, from, info, reply, reagir, isQuotedImage, isQuotedVideo, isQuotedSticker, q, quotedMsg }) {
    const isImage = !!info.message?.imageMessage
    const isVideo = !!info.message?.videoMessage
    const isSticker = !!info.message?.stickerMessage
    const qMessage = quotedMsg || info.message?.extendedTextMessage?.contextInfo?.quotedMessage || info.message?.imageMessage?.contextInfo?.quotedMessage || info.message?.videoMessage?.contextInfo?.quotedMessage || info.message?.stickerMessage?.contextInfo?.quotedMessage

    if (!isImage && !isVideo && !isSticker && !isQuotedImage && !isQuotedVideo && !isQuotedSticker) {
      return reply(
`❗ Envie ou *marque* uma imagem/vídeo/figurinha.

• *.sc* — figurinha *circular*
• Marque uma figurinha + *.sc* — reenvia com pack da Nyx`
      )
    }

    try {
      await reagir('⏳')

      let mediaMsg = info
      if (isQuotedImage || isQuotedVideo || isQuotedSticker) {
        mediaMsg = { key: info.key, message: qMessage }
      }

      const buffer = await downloadMediaMessage(mediaMsg, 'buffer', {})
      if (!buffer) return reply('❌ Erro ao baixar a mídia.')

      let packname = 'Nyx Stickers'
      let author = 'Nyx Bot'
      try {
        const config = JSON.parse(fs.readFileSync('./database/config.json'))
        packname = config.packname || packname
        author = config.author || author
      } catch {}

      // Se for texto com pack custom: .sc Pack | Autor
      if (q && q.includes('|')) {
        const parts = q.split('|').map(s => s.trim())
        if (parts[0]) packname = parts[0].slice(0, 30)
        if (parts[1]) author = parts[1].slice(0, 30)
      }

      const hasVideo = isVideo || isQuotedVideo || !!(quotedMsg?.videoMessage)
      const hasSticker = isSticker || isQuotedSticker || !!(quotedMsg?.stickerMessage)

      if (hasVideo) {
        await sendVideoAsSticker2(nyx, from, buffer, info, { packname, author, mode: 'square' })
      } else {
        // circular ≈ square (crop centro)
        await sendImageAsSticker2(nyx, from, buffer, info, { packname, author, mode: 'square' })
      }

      await reagir('✅')
    } catch (e) {
      console.error('[sc]', e)
      await reagir('❌')
      reply('❌ Erro no .sc')
    }
  }
}
