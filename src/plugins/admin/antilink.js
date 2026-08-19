const fs = require('fs')

const CONFIG_PATH = './database/features.json'

function loadFeatures() {
  try {
    if (fs.existsSync(CONFIG_PATH)) return JSON.parse(fs.readFileSync(CONFIG_PATH))
  } catch {}
  return { antidelete: true, viewonce: true, antilink: false }
}

function saveFeatures(data) {
  fs.writeFileSync(CONFIG_PATH, JSON.stringify(data, null, 2))
}

module.exports = {
  name: 'antilink',
  description: 'Liga/desliga antilink no grupo',
  category: 'admin',
  aliases: ['antlink'],
  async execute({ reply, reagir, isGroup, isAdm, isDono, args }) {
    if (!isGroup) return reply('❌ Só em grupos.')
    if (!isAdm && !isDono) return reply('❌ Só administradores.')

    const features = loadFeatures()
    const action = (args[0] || '').toLowerCase()

    if (action === 'on' || action === 'ligar') {
      features.antilink = true
      saveFeatures(features)
      await reagir('✅')
      return reply('✅ *Antilink ativado!*\nLinks serão apagados automaticamente.')
    }
    if (action === 'off' || action === 'desligar') {
      features.antilink = false
      saveFeatures(features)
      await reagir('✅')
      return reply('❌ *Antilink desativado.*')
    }

    const status = features.antilink ? '✅ Ativado' : '❌ Desativado'
    reply(`🔗 *Antilink*\n\nStatus: ${status}\n\nUso:\n!antilink on\n!antilink off`)
  }
}
