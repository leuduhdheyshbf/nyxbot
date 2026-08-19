const fs = require('fs');
const path = require('path');
const sharp = require('sharp');
const { downloadMediaMessage } = require('@whiskeysockets/baileys');

module.exports = {
    name: 'toimg',
    description: 'Converte um sticker em imagem',
    category: 'cmds-aleatorios',
    aliases: ['stickerimg', 'stkimg'],
    async execute({ nyx, from, info, args, reply, sender }) {
        try {
            // 1. Buscar a mensagem citada (quoted) dentro do próprio info
            const ctxInfo = info.message?.extendedTextMessage?.contextInfo || null;
            const quotedMsg = ctxInfo?.quotedMessage || null;

            if (!quotedMsg) {
                return reply(`❌ Responda a um *sticker* com .toimg`, from, info);
            }

            // 2. Verificar se é um sticker
            if (!quotedMsg.stickerMessage) {
                return reply(`❌ A mensagem respondida não é um sticker.`, from, info);
            }

            // 3. CRIAR UM OBJETO INFO COM OS DADOS DA MENSAGEM ORIGINAL
            // Isso é necessário porque o Baileys precisa da mensagem original para baixar
            const quotedInfo = {
                key: {
                    remoteJid: from,
                    fromMe: false,
                    id: ctxInfo?.stanzaId,
                    participant: ctxInfo?.participant || sender
                },
                message: quotedMsg,
                pushName: info.pushName
            };

            // 4. Baixar o sticker usando o novo objeto
            let buffer;
            try {
                buffer = await downloadMediaMessage(quotedInfo, 'buffer', {});
            } catch (err) {
                console.error('Erro ao baixar:', err);
                return reply(`❌ Erro ao baixar o sticker: ${err.message}`, from, info);
            }

            if (!buffer) {
                return reply(`❌ Não foi possível baixar o sticker.`, from, info);
            }

            // 5. Converter sticker para imagem
            let imagemBuffer;
            try {
                imagemBuffer = await sharp(buffer)
                .png()
                .toBuffer();
            } catch (err) {
                // Fallback para Jimp se sharp falhar
                try {
                    const Jimp = require('jimp');
                    const imagem = await Jimp.read(buffer);
                    imagemBuffer = await imagem.getBufferAsync(Jimp.MIME_PNG);
                } catch (err2) {
                    return reply(`❌ Erro ao converter o sticker: ${err.message}`, from, info);
                }
            }

            // 6. Enviar a imagem
            await nyx.sendMessage(from, {
                image: imagemBuffer,
                caption: `✅ Sticker convertido para imagem!`
            }, { quoted: info });

            // 7. Reagir com sucesso
            await nyx.sendMessage(from, { react: { text: '✅', key: info.key } });

        } catch (err) {
            console.error('Erro no toimg:', err);
            await nyx.sendMessage(from, { react: { text: '❌', key: info.key } });
            reply(`❌ Erro ao converter: ${err.message}`, from, info);
        }
    }
};
