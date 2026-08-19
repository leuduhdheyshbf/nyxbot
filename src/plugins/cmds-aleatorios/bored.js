const axios = require('axios')
module.exports = {
  name: 'bored',
  description: 'Atividade aleatória pra tédio',
  category: 'cmds-aleatorios',
  aliases: ['tedio'],
  async execute({ reply, reagir }) {
    await reagir('😐')
    try {
      const axios = require('axios')
      const { data } = await axios.get('https://bored-api.appbrewery.com/random', { timeout: 10000 })
      await reply(`😐 *Ideia:* ${data.activity}\nTipo: ${data.type}`)
    } catch {
      const fallback = ['Ler 10 páginas', 'Organizar a galeria', 'Mandar um meme no grupo', 'Fazer uma playlist', 'Desenhar qualquer coisa']
      await reply('😐 ' + fallback[Math.floor(Math.random() * fallback.length)])
    }
  }
}
