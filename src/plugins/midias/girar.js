const { downloadMediaMessage } = require('@whiskeysockets/baileys')
const { Jimp } = require('jimp')

module.exports = {
  name: 'girar',
  description: 'Gira a imagem (90, 180, 270)',
  category: 'midias',
  aliases: ['rotate', 'rotacionar'],
  async execute({ nyx, from, info, reply, reagir, q, isQuotedImage, quotedMsg }) {
    const isImage = !!info.message?.imageMessage
    if (!isImage && !isQuotedImage) {
      return reply('❗ Envie ou marque uma *imagem*.\nEx: .girar 90')
    }

    let deg = parseInt(q) || 90
    if (![90, 180, 270, -90].includes(deg)) deg = 90

    try {
      await reagir('⏳')
      let mediaMsg = info
      if (isQuotedImage) {
        const ctx = info.message?.extendedTextMessage?.contextInfo ||
          info.message?.imageMessage?.contextInfo || {}
        const qmsg = quotedMsg || ctx.quotedMessage
        mediaMsg = {
          key: {
            remoteJid: from,
            fromMe: false,
            id: ctx.stanzaId || info.key?.id,
            participant: ctx.participant
          },
          message: qmsg
        }
      }
      const buffer = await downloadMediaMessage(mediaMsg, 'buffer', {})
      const img = await Jimp.read(buffer)
      img.rotate(deg)
      const out = await img.getBuffer('image/jpeg')

      await nyx.sendMessage(from, {
        image: out,
        caption: `🔄 *Girado ${deg}°*`
      }, { quoted: info })
      await reagir('✅')
    } catch (e) {
      reply('❌ Erro ao processar imagem: ' + (e.message || e))
    }
  }
}
