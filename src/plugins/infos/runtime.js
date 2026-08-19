module.exports = {
  name: 'runtime',
  description: 'Tempo online do bot',
  category: 'infos',
  aliases: ['uptime'],
  async execute({ reply }) {
    const s = Math.floor(process.uptime())
    const h = Math.floor(s / 3600)
    const m = Math.floor((s % 3600) / 60)
    const sec = s % 60
    await reply(`⏱️ Runtime: ${h}h ${m}m ${sec}s`)
  }
}
