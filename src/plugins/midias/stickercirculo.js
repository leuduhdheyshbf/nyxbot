const { downloadMediaMessage } = require('@whiskeysockets/baileys')
// [NyxFix] require de exif2.js removido (não existe na V2)
const jimp = require('jimp')
const fs = require('fs')

module.exports = {
  name: 'stickercirculo',
  description: 'Figurinha circular',
  category: 'midias',
  aliases: ['sc', 'circulo', 'circle'],
  async execute({ nyx, from, info, reply, reagir, isQuotedImage }) {
    const isImage = !!info.message?.imageMessage
    const quotedMsg = info.message?.extendedTextMessage?.contextInfo?.quotedMessage
    if (!isImage && !isQuotedImage) return reply('❗ Envie ou marque uma imagem com .sc')

    try {
      await reagir('⏳')
      const mediaMsg = isQuotedImage ? { key: info.key, message: quotedMsg } : info
      const buffer = await downloadMediaMessage(mediaMsg, 'buffer', {})
      const img = await jimp.read(buffer)
      img.cover(512, 512)
      // máscara circular
      img.scan(0, 0, 512, 512, function (x, y, idx) {
        const dx = x - 256, dy = y - 256
        if (dx*dx + dy*dy > 256*256) {
          this.bitmap.data[idx + 3] = 0
        }
      })
      const out = await img.getBufferAsync(jimp.MIME_PNG)
      const config = JSON.parse(fs.readFileSync('./database/config.json'))
      await sendImageAsSticker2(nyx, from, out, info, {
        packname: config.packname || 'Nyx',
        author: config.author || 'Bot'
      })
      await reagir('✅')
    } catch (e) {
      console.error(e)
      reply('❌ Erro ao criar figurinha circular.')
    }
  }
}
