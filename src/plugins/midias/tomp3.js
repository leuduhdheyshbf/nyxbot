const { downloadMediaMessage } = require('@whiskeysockets/baileys')
const { exec } = require('child_process')
const fs = require('fs')
const path = require('path')
const { tmpdir } = require('os')
const Crypto = require('crypto')

module.exports = {
  name: 'tomp3',
  description: 'Converte vídeo/áudio em mp3',
  category: 'midias',
  aliases: ['mp3', 'toaudio'],
  async execute({ nyx, from, info, reply, reagir, isQuotedVideo, isQuotedAudio }) {
    const isVideo = !!info.message?.videoMessage
    const isAudio = !!info.message?.audioMessage
    const qMessage = quotedMsg || info.message?.extendedTextMessage?.contextInfo?.quotedMessage || info.message?.imageMessage?.contextInfo?.quotedMessage || info.message?.videoMessage?.contextInfo?.quotedMessage || info.message?.stickerMessage?.contextInfo?.quotedMessage
    if (!isVideo && !isAudio && !isQuotedVideo && !isQuotedAudio) {
      return reply('❗ Envie ou marque um vídeo/áudio com .tomp3')
    }
    try {
      await reagir('🎵')
      const mediaMsg = (isQuotedVideo||isQuotedAudio) ? { key: info.key, message: qMessage } : info
      const buffer = await downloadMediaMessage(mediaMsg, 'buffer', {})
      const tmpIn = path.join(tmpdir(), Crypto.randomBytes(6).toString('hex') + '.mp4')
      const tmpOut = path.join(tmpdir(), Crypto.randomBytes(6).toString('hex') + '.mp3')
      fs.writeFileSync(tmpIn, buffer)
      await new Promise((res, rej) => {
        exec(`ffmpeg -i "${tmpIn}" -vn -ab 128k "${tmpOut}"`, e => e ? rej(e) : res())
      })
      await nyx.sendMessage(from, {
        audio: fs.readFileSync(tmpOut),
        mimetype: 'audio/mpeg'
      }, { quoted: info })
      try{fs.unlinkSync(tmpIn);fs.unlinkSync(tmpOut)}catch{}
      await reagir('✅')
    } catch (e) {
      console.error(e)
      reply('❌ Erro na conversão.')
    }
  }
}
