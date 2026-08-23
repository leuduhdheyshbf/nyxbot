const axios = require('axios')
const fs = require('fs')
const path = require('path')
const { tmpdir } = require('os')
const FormData = require('form-data')
const Crypto = require('crypto')
const { downloadMediaMessage } = require('@whiskeysockets/baileys')

module.exports = {
  name: 'removebg',
  description: 'Remove fundo da imagem (Remove.bg)',
  category: 'midias',
  aliases: ['rbg', 'semfundo', 'bg'],
  async execute({ nyx, from, info, reply, reagir, isQuotedImage, quotedMsg }) {
    const config = JSON.parse(fs.readFileSync('./database/config.json'))
    const apiKey = (config.removebgApiKey || '').trim()

    if (!apiKey) {
      return reply(
`❗ *Remove.bg não configurado*

1. Crie conta grátis: https://www.remove.bg/api
2. Copie a API Key
3. Em database/config.json:
   "removebgApiKey": "SUA_KEY_AQUI"

Plano free: ~50 imagens/mês.`
      )
    }

    const isImage = !!info.message?.imageMessage
    const qMessage = quotedMsg || info.message?.extendedTextMessage?.contextInfo?.quotedMessage || info.message?.imageMessage?.contextInfo?.quotedMessage || info.message?.videoMessage?.contextInfo?.quotedMessage || info.message?.stickerMessage?.contextInfo?.quotedMessage

    if (!isImage && !isQuotedImage) {
      return reply('❗ Envie ou *responda* uma imagem com .removebg')
    }

    try {
      await reagir('✂️')
      reply('✂️ Removendo fundo...')

      const mediaMsg = isQuotedImage
        ? { key: info.key, message: qMessage }
        : info

      const buffer = await downloadMediaMessage(mediaMsg, 'buffer', {})
      if (!buffer || buffer.length < 100) {
        return reply('❌ Imagem inválida.')
      }

      const form = new FormData()
      form.append('image_file', buffer, {
        filename: 'image.jpg',
        contentType: 'image/jpeg'
      })
      form.append('size', 'auto')

      const { data } = await axios.post(
        'https://api.remove.bg/v1.0/removebg',
        form,
        {
          headers: {
            ...form.getHeaders(),
            'X-Api-Key': apiKey
          },
          responseType: 'arraybuffer',
          timeout: 60000
        }
      )

      const out = path.join(tmpdir(), `rbg_${Crypto.randomBytes(4).toString('hex')}.png`)
      fs.writeFileSync(out, Buffer.from(data))

      await nyx.sendMessage(
        from,
        {
          image: fs.readFileSync(out),
          caption: '✅ Fundo removido\n⚔ Nyx Bot · Remove.bg'
        },
        { quoted: info }
      )

      try { fs.unlinkSync(out) } catch {}
      await reagir('✅')
    } catch (e) {
      console.error('[removebg]', e?.response?.status, e?.message || e)
      await reagir('❌')
      const status = e?.response?.status
      if (status === 403 || status === 401) {
        return reply('❌ API Key inválida. Confira removebgApiKey no config.json')
      }
      if (status === 402) {
        return reply('❌ Limite free do Remove.bg esgotado este mês.')
      }
      reply('❌ Erro ao remover fundo. Tente outra imagem.')
    }
  }
}
