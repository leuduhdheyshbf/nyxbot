const fs = require('fs')

const CONFIG_PATH = './database/features.json'

function loadFeatures() {
  try {
    if (fs.existsSync(CONFIG_PATH)) {
      return JSON.parse(fs.readFileSync(CONFIG_PATH))
    }
  } catch {}
  return { antidelete: true, viewonce: true }
}

function saveFeatures(data) {
  fs.writeFileSync(CONFIG_PATH, JSON.stringify(data, null, 2))
}

module.exports = {
  name: 'antidelete',
  description: 'Liga/desliga o anti-delete (só funciona em PV)',
  category: 'admin',
  aliases: ['antidel', 'antidelete'],
  async execute({ reply, reagir, isGroup, isAdm, isDono, args }) {
    // Agora o anti-delete só age em PV, então o comando pode ser usado em qualquer lugar
    if (isGroup && !isAdm && !isDono) return reply('❌ Apenas administradores.')

    const features = loadFeatures()
    const action = (args[0] || '').toLowerCase()

    if (action === 'on' || action === 'ligar' || action === '1') {
      features.antidelete = true
      saveFeatures(features)
      await reagir('✅')
      return reply('✅ *Anti-Delete ativado!*\n\nAgora quando alguém apagar mensagem no *PV*, o bot mostra o conteúdo.\n\n⚠️ Não funciona em grupos.')
    }

    if (action === 'off' || action === 'desligar' || action === '0') {
      features.antidelete = false
      saveFeatures(features)
      await reagir('✅')
      return reply('❌ *Anti-Delete desativado.*')
    }

    const status = features.antidelete ? '✅ Ativado' : '❌ Desativado'
    reply(`🗑️ *Anti-Delete* (somente PV)\n\nStatus: ${status}\n\nUso:\n!antidelete on\n!antidelete off\n\n⚠️ Funciona *apenas em conversas privadas*.`)
  }
}
