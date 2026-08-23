module.exports = {
  name: 'emoji',
  description: 'Emoji aleatório',
  category: 'utilidades',
  aliases: ['emojirand'],
  async execute({ reply, reagir }) {
    const list = ['😀','🔥','🦇','🩸','✨','🌙','⚡','🎮','💀','🌹','🧊','👁️','🖤','👑','🌀']
    const e = list[Math.floor(Math.random() * list.length)]
    await reagir(e)
    await reply(e)
  }
}
