const { downloadMediaMessage } = require('@whiskeysockets/baileys')
const { Jimp } = require('jimp')

module.exports = {
  name: 'invert',
  description: 'Inverte as cores da imagem',
  category: 'efeitos',
  aliases: ['inverter', 'negative', 'negativo', 'inveert', 'inverso'],
  async execute({ nyx, from, info, reply, reagir, isQuotedImage, quotedMsg }) {
    const isImage = !!info.message?.imageMessage
    if (!isImage && !isQuotedImage) {
      return reply('❗ Envie ou marque uma *imagem* com o comando.')
    }

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
      img.invert()
      const out = await img.getBuffer('image/jpeg')

      await nyx.sendMessage(from, {
        image: out,
        caption: '🎨 *Cores invertidas*'
      }, { quoted: info })
      await reagir('✅')
    } catch (e) {
      reply('❌ Erro ao processar imagem: ' + (e.message || e))
    }
  }
}
