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
  name: 'viewonce',
  description: 'Liga/desliga o salvamento de visu única',
  category: 'admin',
  aliases: ['vv', 'visualizacao', 'visuunica'],
  async execute({ reply, reagir, isGroup, isAdm, isDono, args }) {
    if (!isGroup) return reply('❌ Só funciona em grupos.')
    if (!isAdm && !isDono) return reply('❌ Apenas administradores.')

    const features = loadFeatures()
    const action = (args[0] || '').toLowerCase()

    if (action === 'on' || action === 'ligar' || action === '1') {
      features.viewonce = true
      saveFeatures(features)
      await reagir('✅')
      return reply('✅ *Salvar Visu Única ativado!*\n\nFotos/vídeos de visualização única serão salvos automaticamente.')
    }

    if (action === 'off' || action === 'desligar' || action === '0') {
      features.viewonce = false
      saveFeatures(features)
      await reagir('✅')
      return reply('❌ *Salvar Visu Única desativado.*')
    }

    const status = features.viewonce ? '✅ Ativado' : '❌ Desativado'
    reply(`🔓 *Salvar Visu Única*\n\nStatus: ${status}\n\nUso:\n!viewonce on\n!viewonce off`)
  }
}
