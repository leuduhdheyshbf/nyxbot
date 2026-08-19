const { downloadMediaMessage } = require('@whiskeysockets/baileys')
// [NyxFix] require de exif2.js removido (não existe na V2)
const fs = require('fs')

module.exports = {
  name: 'swm',
  description: 'Cria figurinha com pack/autor personalizado',
  category: 'cmds-aleatorios',
  aliases: ['stickerwm', 'wm'],
  async execute({ nyx, from, info, reply, reagir, q, isQuotedImage, isQuotedVideo, quotedMsg }) {
    const isImage = !!info.message?.imageMessage
    const isVideo = !!info.message?.videoMessage
    if (!isImage && !isVideo && !isQuotedImage && !isQuotedVideo) {
      return reply('❗ Envie ou marque uma imagem/vídeo.\nEx: .swm MeuPack | Autor')
    }

    let packname = 'Nyx Stickers'
    let author = 'Nyx Bot'
    if (q) {
      const parts = q.split('|').map(s => s.trim())
      if (parts[0]) packname = parts[0].slice(0, 30)
      if (parts[1]) author = parts[1].slice(0, 30)
    }

    try {
      await reagir('⏳')
      let mediaMsg = info
      if (isQuotedImage || isQuotedVideo) {
        mediaMsg = {
          key: info.key,
          message: (quotedMsg || info.message?.extendedTextMessage?.contextInfo?.quotedMessage || info.message?.imageMessage?.contextInfo?.quotedMessage || info.message?.videoMessage?.contextInfo?.quotedMessage || info.message?.stickerMessage?.contextInfo?.quotedMessage)
        }
      }

      const buffer = await downloadMediaMessage(mediaMsg, 'buffer', {})
      const quotedIsVideo = isVideo || isQuotedVideo

      if (quotedIsVideo) {
        await sendVideoAsSticker2(nyx, from, buffer, info, { packname, author })
      } else {
        await sendImageAsSticker2(nyx, from, buffer, info, { packname, author })
      }
      await reagir('✅')
    } catch (e) {
      reply('❌ Erro ao criar figurinha: ' + (e.message || e))
    }
  }
}
