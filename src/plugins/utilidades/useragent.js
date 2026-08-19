module.exports = {
  name: 'useragent',
  description: 'Mostra um User-Agent de exemplo',
  category: 'utilidades',
  aliases: ['ua'],
  async execute({ reply }) {
    await reply('🧭 Mozilla/5.0 (Linux; Android 14) AppleWebKit/537.36 Chrome/122.0 Mobile Safari/537.36')
  }
}
