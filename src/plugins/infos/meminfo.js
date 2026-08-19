module.exports = {
  name: 'meminfo',
  description: 'Uso de memória do processo',
  category: 'infos',
  aliases: ['ram'],
  async execute({ reply }) {
    const m = process.memoryUsage()
    await reply(`🧠 RSS: ${(m.rss/1024/1024).toFixed(1)} MB\nHeap: ${(m.heapUsed/1024/1024).toFixed(1)}/${(m.heapTotal/1024/1024).toFixed(1)} MB`)
  }
}
