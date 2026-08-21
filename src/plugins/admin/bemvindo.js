'use strict'

const fs = require('fs')
const path = require('path')

const ROOT = path.join(__dirname, '..', '..', '..')
const WELCOME_PATH = path.join(ROOT, 'database', 'json', 'welcome.json')

function ensureWelcomeFile() {
  const dir = path.dirname(WELCOME_PATH)
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true })
    if (!fs.existsSync(WELCOME_PATH)) {
      fs.writeFileSync(WELCOME_PATH, JSON.stringify({ groups: [] }, null, 2))
    }
}

function loadWelcome() {
  ensureWelcomeFile()
  try {
    const data = JSON.parse(fs.readFileSync(WELCOME_PATH, 'utf8'))
    if (Array.isArray(data)) return { groups: data }
    return { groups: Array.isArray(data.groups) ? data.groups : [] }
  } catch {
    return { groups: [] }
  }
}

function saveWelcome(data) {
  ensureWelcomeFile()
  fs.writeFileSync(WELCOME_PATH, JSON.stringify(data, null, 2))
}

function isWelcomeEnabled(groupId) {
  const data = loadWelcome()
  return data.groups.includes(groupId)
}

function setWelcome(groupId, enabled) {
  const data = loadWelcome()
  if (enabled) {
    if (!data.groups.includes(groupId)) data.groups.push(groupId)
  } else {
    data.groups = data.groups.filter((g) => g !== groupId)
  }
  saveWelcome(data)
}

module.exports = {
  name: 'bemvindo',
  originalName: 'bemvindo',
  description: 'Sistema de boas-vindas com foto de perfil (Las Vegas)',
  category: 'admin',
  aliases: ['boasvindas', 'welcome'],

  // Exportado para o handler de grupo
  isWelcomeEnabled,
  setWelcome,
  loadWelcome,

  async execute({ client, from, info, args, reply, isAdm, isDono, isGroup, prefix, reagir }) {
    if (!isGroup) {
      return reply('❌ Este comando só pode ser usado em grupos!')
    }
    if (!isAdm && !isDono) {
      return reply('❌ Apenas administradores podem usar este comando!')
    }

    const sub = (args[0] || '').toLowerCase()

    if (sub === 'on' || sub === '1' || sub === 'ativar') {
      if (isWelcomeEnabled(from)) {
        return reply('🎰 O sistema de boas-vindas já está *ATIVADO* neste grupo!')
      }
      setWelcome(from, true)
      if (typeof reagir === 'function') await reagir('✅')
        return reply(
          `🎰 *BOAS-VINDAS ATIVADAS!*\n\n` +
          `Quando um novo membro entrar, o bot enviará a mensagem de Las Vegas com a foto de perfil.\n\n` +
          `Use \`${prefix}bemvindo off\` para desativar.`
        )
    }

    if (sub === 'off' || sub === '0' || sub === 'desativar') {
      if (!isWelcomeEnabled(from)) {
        return reply('❄️ O sistema de boas-vindas já está *DESATIVADO* neste grupo!')
      }
      setWelcome(from, false)
      if (typeof reagir === 'function') await reagir('✅')
        return reply('❄️ *BOAS-VINDAS DESATIVADAS!*\n\nNão enviarei mais mensagens de entrada.')
    }

    if (sub === 'status' || sub === 'info') {
      const ativo = isWelcomeEnabled(from) ? '✅ ATIVADO' : '❌ DESATIVADO'
      return reply(
        `📊 *STATUS — BOAS-VINDAS*\n\n` +
        `🔘 Estado: ${ativo}\n\n` +
        `📌 Comandos:\n` +
        `▸ \`${prefix}bemvindo on\` — Ativar\n` +
        `▸ \`${prefix}bemvindo off\` — Desativar\n` +
        `▸ \`${prefix}bemvindo status\` — Ver status`
      )
    }

    const ativo = isWelcomeEnabled(from) ? 'ATIVADO' : 'DESATIVADO'
    return reply(
      `🎰 *SISTEMA DE BOAS-VINDAS — LAS VEGAS*\n\n` +
      `Status atual: *${ativo}*\n\n` +
      `📌 *Uso:*\n` +
      `▸ \`${prefix}bemvindo on\` — Ativar no grupo\n` +
      `▸ \`${prefix}bemvindo off\` — Desativar no grupo\n` +
      `▸ \`${prefix}bemvindo status\` — Ver status\n\n` +
      `Quando ativo, novos membros recebem a mensagem temática com foto de perfil (ou imagem aleatória).`
    )
  }
}
