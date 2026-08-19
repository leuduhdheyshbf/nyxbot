const axios = require('axios')

module.exports = {
  name: 'qrcode',
  description: 'Gera QR Code de um texto/link',
  category: 'utilidades',
  aliases: ['qr'],
  async execute({ nyx, from, info, reply, reagir, q }) {
    if (!q) return reply('❗ Use: .qrcode https://google.com')
    try {
      await reagir('📱')
      const url = `https://api.qrserver.com/v1/create-qr-code/?size=400x400&data=${encodeURIComponent(q)}`
      await nyx.sendMessage(from, {
        image: { url },
        caption: `📱 QR Code:\n${q.slice(0,100)}`
      }, { quoted: info })
      await reagir('✅')
    } catch { reply('❌ Erro ao gerar QR.') }
  }
}
