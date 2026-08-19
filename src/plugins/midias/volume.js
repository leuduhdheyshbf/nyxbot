const { downloadMediaMessage } = require('@whiskeysockets/baileys')
const { exec } = require('child_process')
const fs = require('fs')
const path = require('path')
const { tmpdir } = require('os')
const Crypto = require('crypto')

module.exports = {
  name: 'volume',
  description: 'Aumenta o volume do áudio',
  category: 'midias',
  aliases: ['vol', 'loud'],
  async execute({ nyx, from, info, reply, reagir, args, isQuotedAudio }) {
    const isAudio = !!info.message?.audioMessage
    const qMessage = quotedMsg || info.message?.extendedTextMessage?.contextInfo?.quotedMessage || info.message?.imageMessage?.contextInfo?.quotedMessage || info.message?.videoMessage?.contextInfo?.quotedMessage || info.message?.stickerMessage?.contextInfo?.quotedMessage
    if (!isAudio && !isQuotedAudio) return reply('❗ Marque um áudio: .volume 2')
    const mult = Math.min(Math.max(parseFloat(args[0]) || 2, 0.5), 5)
    try {
      await reagir('🔊')
      const mediaMsg = isQuotedAudio ? { key: info.key, message: qMessage } : info
      const buffer = await downloadMediaMessage(mediaMsg, 'buffer', {})
      const tmpIn = path.join(tmpdir(), Crypto.randomBytes(6).toString('hex')+'.ogg')
      const tmpOut = path.join(tmpdir(), Crypto.randomBytes(6).toString('hex')+'.mp3')
      fs.writeFileSync(tmpIn, buffer)
      await new Promise((res,rej)=>{
        exec(`ffmpeg -i "${tmpIn}" -filter:a "volume=${mult}" "${tmpOut}"`, e=>e?rej(e):res())
      })
      await nyx.sendMessage(from, {
        audio: fs.readFileSync(tmpOut),
        mimetype: 'audio/mpeg',
        ptt: false
      }, { quoted: info })
      try{fs.unlinkSync(tmpIn);fs.unlinkSync(tmpOut)}catch{}
      await reagir('✅')
    } catch(e){ console.error(e); reply('❌ Erro. Precisa de ffmpeg.') }
  }
}
