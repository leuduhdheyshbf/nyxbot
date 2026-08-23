const fs = require('fs')
const PATH = './database/afk.json'

function load() {
  try {
    if (fs.existsSync(PATH)) return JSON.parse(fs.readFileSync(PATH))
  } catch {}
  return {}
}
function save(data) {
  fs.writeFileSync(PATH, JSON.stringify(data, null, 2))
}

module.exports = {
  name: 'afk',
  description: 'Marca você como ausente (off)',
  category: 'utilidades',
  aliases: ['ausente', 'off'],
  async execute({ reply, reagir, sender, q }) {
    const data = load()
    const motivo = q || 'Sem motivo'

    // se já está afk, tira
    if (data[sender]) {
      const tempo = Date.now() - (data[sender].since || Date.now())
      const min = Math.floor(tempo / 60000)
      delete data[sender]
      save(data)
      await reagir('✅')
      return reply(`✅ Você voltou!\nEsteve ausente por ~${min} min.`)
    }

    data[sender] = {
      motivo,
      since: Date.now()
    }
    save(data)
    await reagir('💤')
    reply(`💤 *AFK ativado*\nMotivo: ${motivo}\n\nQuando alguém te marcar, o bot avisa que você está off.\nUse .afk de novo pra voltar.`)
  }
}
