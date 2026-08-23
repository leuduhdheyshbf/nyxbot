const os = require('os')

module.exports = {
  name: 'status',
  description: 'Status do bot (só dono)',
  category: 'dono',
  aliases: ['botstatus', 'stats', 'uptime'],
  async execute({ reply, isDono, reagir }) {
    if (!isDono) return reply('❌ Só o dono pode usar.')

    await reagir('📊')
    const uptime = process.uptime()
    const h = Math.floor(uptime / 3600)
    const m = Math.floor((uptime % 3600) / 60)
    const s = Math.floor(uptime % 60)

    const mem = process.memoryUsage()
    const usedMB = (mem.heapUsed / 1024 / 1024).toFixed(1)
    const totalMB = (mem.heapTotal / 1024 / 1024).toFixed(1)

    const msg = `📊 *Status do Bot*

⏱️ Uptime: ${h}h ${m}m ${s}s
💾 RAM: ${usedMB} / ${totalMB} MB
🖥️ Plataforma: ${os.platform()}
⚙️ Node: ${process.version}
🤖 Bot online!
`
    reply(msg)
  }
}
