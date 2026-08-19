const fs = require('fs')

const PATH = './database/autoreply.json'

function load() {
  try {
    if (fs.existsSync(PATH)) return JSON.parse(fs.readFileSync(PATH))
  } catch {}
  return {}
}

function save(data) {
  try {
    fs.writeFileSync(PATH, JSON.stringify(data, null, 2))
  } catch {}
}

module.exports = {
  name: 'autoreply',
  description: 'Configura auto-resposta no grupo',
  category: 'utilidades',
  aliases: ['autoresposta', 'ar'],
  async execute({ reply, q, from, isGroup, isAdm, isDono }) {
    if (!isGroup) return reply('❗ Só funciona em grupos.')
    if (!isAdm && !isDono) return reply('❗ Apenas admins.')

    const data = load()
    if (!data[from]) data[from] = {}

    if (!q) {
      const entries = Object.entries(data[from])
      if (!entries.length) return reply('📋 Nenhuma auto-resposta.\n\nUso:\n.autoreply add | palavra | resposta\n.autoreply del | palavra\n.autoreply list')
      let txt = '📋 *Auto-respostas:*\n\n'
      entries.forEach(([k, v]) => { txt += `• *${k}* → ${v}\n` })
      return reply(txt)
    }

    const parts = q.split('|').map(s => s.trim())
    const acao = parts[0]?.toLowerCase()

    if (acao === 'list' || acao === 'lista') {
      const entries = Object.entries(data[from])
      if (!entries.length) return reply('📋 Nenhuma auto-resposta configurada.')
      let txt = '📋 *Auto-respostas:*\n\n'
      entries.forEach(([k, v]) => { txt += `• *${k}* → ${v}\n` })
      return reply(txt)
    }

    if (acao === 'add' || acao === 'set') {
      const key = (parts[1] || '').toLowerCase()
      const val = parts.slice(2).join('|').trim()
      if (!key || !val) return reply('❗ Uso: .autoreply add | palavra | resposta')
      data[from][key] = val
      save(data)
      return reply(`✅ Auto-resposta adicionada:\n*${key}* → ${val}`)
    }

    if (acao === 'del' || acao === 'rm' || acao === 'remover') {
      const key = (parts[1] || '').toLowerCase()
      if (!key || !data[from][key]) return reply('❗ Palavra não encontrada.')
      delete data[from][key]
      save(data)
      return reply(`🗑️ Removido: *${key}*`)
    }

    reply('❗ Uso:\n.autoreply add | palavra | resposta\n.autoreply del | palavra\n.autoreply list')
  }
}
