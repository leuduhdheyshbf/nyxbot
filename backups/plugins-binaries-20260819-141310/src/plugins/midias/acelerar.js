const { downloadMediaMessage } = require('@whiskeysockets/baileys')
const { exec } = require('child_process')
const fs = require('fs')
const path = require('path')
const { tmpdir } = require('os')
const Crypto = require('crypto')

module.exports = {
  name: 'acelerar',
  description: 'Acelera áudio/vídeo',
  category: 'midias',
  aliases: ['speed', 'rapido'],
  async execute({ nyx, from, info, reply, reagir, args, isQuotedAudio, isQuotedVideo }) {
    const isAudio = !!info.message?.audioMessage
    const isVideo = !!info.message?.videoMessage
    const qMessage = quotedMsg || info.message?.extendedTextMessage?.contextInfo?.quotedMessage || info.message?.imageMessage?.contextInfo?.quotedMessage || info.message?.videoMessage?.contextInfo?.quotedMessage || info.message?.stickerMessage?.contextInfo?.quotedMessage
    if (!isAudio && !isVideo && !isQuotedAudio && !isQuotedVideo) return reply('❗ Marque áudio/vídeo: .acelerar 1.5')
    const speed = Math.min(Math.max(parseFloat(args[0]) || 1.5, 0.5), 3)
    try {
      await reagir('⚡')
      const mediaMsg = (isQuotedAudio||isQuotedVideo) ? { key: info.key, message: qMessage } : info
      const buffer = await downloadMediaMessage(mediaMsg, 'buffer', {})
      const isVid = isVideo || isQuotedVideo
      const tmpIn = path.join(tmpdir(), Crypto.randomBytes(6).toString('hex')+(isVid?'.mp4':'.ogg'))
      const tmpOut = path.join(tmpdir(), Crypto.randomBytes(6).toString('hex')+(isVid?'.mp4':'.mp3'))
      fs.writeFileSync(tmpIn, buffer)
      const filter = isVid
        ? `-filter_complex "[0:v]setpts=${1/speed}*PTS[v];[0:a]atempo=${speed}[a]" -map "[v]" -map "[a]"`
        : `-filter:a "atempo=${speed}"`
      await new Promise((res,rej)=>{
        exec(`ffmpeg -i "${tmpIn}" ${filter} "${tmpOut}"`, e=>e?rej(e):res())
      })
      if (isVid) {
        await nyx.sendMessage(from, { video: fs.readFileSync(tmpOut), caption: `⚡ ${speed}x` }, { quoted: info })
      } else {
        await nyx.sendMessage(from, { audio: fs.readFileSync(tmpOut), mimetype: 'audio/mpeg' }, { quoted: info })
      }
      try{fs.unlinkSync(tmpIn);fs.unlinkSync(tmpOut)}catch{}
      await reagir('✅')
    } catch(e){ console.error(e); reply('❌ Erro. Precisa de ffmpeg.') }
  }
}
