'use strict'

module.exports = {
  name: 'ping',
  description: 'Latência do bot',
  category: 'utilidades',
  aliases: ['latencia'],
  cooldown: 3,
  async execute({ reply, client }) {
    const t = Date.now()
    await reply(`🩸 *Pong!*\n⏱️ ${Date.now() - t}ms`)
  }
}
