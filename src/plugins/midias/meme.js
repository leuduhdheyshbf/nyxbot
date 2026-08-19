const { downloadMediaMessage } = require('@whiskeysockets/baileys')
const jimp = require('jimp')

module.exports = {
  name: 'meme',
  description: 'Meme com texto em cima e embaixo',
  category: 'midias',
  aliases: ['memetext'],
  async execute({ nyx, from, info, reply, reagir, q, isQuotedImage }) {
    // .meme texto cima | texto baixo
    const isImage = !!info.message?.imageMessage
    const quotedMsg = info.message?.extendedTextMessage?.contextInfo?.quotedMessage
    if (!isImage && !isQuotedImage) return reply('❗ Envie/marque imagem + .meme cima | baixo')
    if (!q) return reply('❗ Use: .meme texto de cima | texto de baixo')

    try {
      await reagir('😂')
      const parts = q.split('|').map(s=>s.trim())
      const top = parts[0] || ''
      const bottom = parts[1] || ''

      const mediaMsg = isQuotedImage ? { key: info.key, message: quotedMsg } : info
      const buffer = await downloadMediaMessage(mediaMsg, 'buffer', {})
      const img = await jimp.read(buffer)
      img.resize(800, jimp.AUTO)
      const font = await jimp.loadFont(jimp.FONT_SANS_32_WHITE)
      const w = img.bitmap.width
      if (top) {
        const tw = jimp.measureText(font, top)
        img.print(font, (w-tw)/2, 20, top)
      }
      if (bottom) {
        const tw = jimp.measureText(font, bottom)
        img.print(font, (w-tw)/2, img.bitmap.height - 50, bottom)
      }
      const out = await img.getBufferAsync(jimp.MIME_JPEG)
      await nyx.sendMessage(from, { image: out, caption: '😂 Meme' }, { quoted: info })
      await reagir('✅')
    } catch (e) {
      console.error(e)
      reply('❌ Erro no meme.')
    }
  }
}
