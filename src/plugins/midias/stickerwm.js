const { downloadMediaMessage } = require('@whiskeysockets/baileys')
// [NyxFix] require de exif2.js removido (não existe na V2)

module.exports = {
  name: 'stickerwm',
  description: 'Figurinha com pack/author personalizado',
  category: 'midias',
  aliases: ['swm', 'take', 'roubar'],
  async execute({ nyx, from, info, reply, reagir, q, isQuotedImage, isQuotedVideo, isQuotedSticker }) {
    // .swm pack|author  (respondendo mídia)
    const quotedMsg = info.message?.extendedTextMessage?.contextInfo?.quotedMessage
    const isImage = !!info.message?.imageMessage
    const isVideo = !!info.message?.videoMessage

    if (!isImage && !isVideo && !isQuotedImage && !isQuotedVideo && !isQuotedSticker) {
      return reply('❗ Responda uma mídia com:\n.swm nome do pack|autor')
    }

    const parts = (q || 'Nyx|Bot').split('|')
    const packname = (parts[0] || 'Nyx').trim()
    const author = (parts[1] || 'Bot').trim()

    try {
      await reagir('⏳')
      let mediaMsg = info
      if (isQuotedImage || isQuotedVideo || isQuotedSticker) {
        mediaMsg = { key: info.key, message: quotedMsg }
      }
      const buffer = await downloadMediaMessage(mediaMsg, 'buffer', {})
      if (!buffer) return reply('❌ Erro ao baixar.')

      if (isVideo || isQuotedVideo) {
        await sendVideoAsSticker2(nyx, from, buffer, info, { packname, author })
      } else {
        await sendImageAsSticker2(nyx, from, buffer, info, { packname, author })
      }
      await reagir('✅')
    } catch (e) {
      console.error(e)
      reply('❌ Erro ao criar figurinha.')
    }
  }
}
