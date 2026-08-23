module.exports = {
  name: 'uuid',
  description: 'Gera um UUID v4',
  category: 'utilidades',
  aliases: ['guid'],
  async execute({ reply, reagir }) {
    await reagir('🆔')
    const id = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, c => {
      const r = Math.random() * 16 | 0
      const v = c === 'x' ? r : (r & 0x3 | 0x8)
      return v.toString(16)
    })
    await reply('🆔 ' + id)
  }
}
