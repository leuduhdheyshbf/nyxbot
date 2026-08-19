const { downloadMediaMessage } = require('@whiskeysockets/baileys')
// [NyxFix] require de exif2.js removido (não existe na V2)
const fs = require('fs')

module.exports = {
    name: 'sticker',
    description: 'Transforma imagem ou vídeo em figurinha (normal / quadrada / esticada)',
    category: 'cmds-aleatorios',
    aliases: ['s', 'f', 'fig', 'figurinha', 'stiker'],
    async execute({ nyx, from, info, reply, reagir, q, isQuotedImage, isQuotedVideo, isQuotedSticker, quotedMsg }) {
        try {
            const isImage = !!info.message?.imageMessage
            const isVideo = !!info.message?.videoMessage
            const qMessage = quotedMsg || info.message?.extendedTextMessage?.contextInfo?.quotedMessage || info.message?.imageMessage?.contextInfo?.quotedMessage || info.message?.videoMessage?.contextInfo?.quotedMessage || info.message?.stickerMessage?.contextInfo?.quotedMessage

            if (!isImage && !isVideo && !isQuotedImage && !isQuotedVideo) {
                return reply(`❗ Envie ou marque uma *imagem* ou *vídeo* com o comando

📌 Opções:
• .s → normal (mantém proporção)
• .s quadrada → corta no centro
• .s esticar → estica pra preencher`)
            }

            // Detecta modo
            const arg = (q || '').toLowerCase().trim()
            let mode = 'normal'
            if (arg.includes('quadrad') || arg.includes('crop') || arg.includes('square')) {
                mode = 'square'
            } else if (arg.includes('estic') || arg.includes('stretch') || arg.includes('full')) {
                mode = 'stretch'
            }

            await reagir('⏳')

            let mediaMsg = info
            if (isQuotedImage || isQuotedVideo || isQuotedSticker) {
                mediaMsg = {
                    key: info.key,
                    message: qMessage
                }
            }

            const buffer = await downloadMediaMessage(mediaMsg, 'buffer', {})
            if (!buffer) return reply('❌ Erro ao baixar a mídia.')

            const config = JSON.parse(fs.readFileSync('./database/config.json'))
            const packname = config.packname || 'Nyx Stickers'
            const author = config.author || 'Nyx Bot'

            // Vídeo / GIF
            if (isVideo || isQuotedVideo) {
                const videoMsg = info.message?.videoMessage || qMessage?.videoMessage
                const seconds = videoMsg?.seconds || 0

                if (seconds > 10) {
                    await reagir('❌')
                    return reply('❌ O vídeo precisa ter no máximo *10 segundos* para virar figurinha animada.')
                }

                await sendVideoAsSticker2(nyx, from, buffer, info, { packname, author, mode })
                await reagir('✅')
                return
            }

            // Imagem
            await sendImageAsSticker2(nyx, from, buffer, info, { packname, author, mode })
            await reagir('✅')

        } catch (e) {
            console.error('Erro no sticker:', e)
            await reagir('❌')
            reply('❌ Deu erro ao criar a figurinha. Tente novamente.')
        }
    }
}
