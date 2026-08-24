'use strict'

const db = require('../../core/database')
const { toJid, cleanNumber } = require('../../utils/helpers')

module.exports = {
  name: 'unmute',
  description: 'Libera um membro silenciado',
  category: 'admin',
  aliases: ['dessilenciar'],
  admin: true,

  async execute({ from, info, reply, reagir, isGroup, isAdm, isDono, args, sock }) {
    if (!isGroup) return reply('❌ Só em grupos.')
      if (!isAdm && !isDono) return reply('❌ Só admins.')

        const quoted = info.message?.extendedTextMessage?.contextInfo
        let target = quoted?.participant || quoted?.mentionedJid?.[0]

        if (!target && args[0]) {
          const n = cleanNumber(args[0])
          if (n) target = n + '@s.whatsapp.net'
        }
        target = toJid(target) || target

        if (!target) return reply('❗ Marque ou responda alguém.\nEx: .unmute @pessoa')

          try {
            await db.removeMute(from, target)

            if (typeof db.hydrateAll === 'function') {
              await db.hydrateAll()
            }

            if (typeof reagir === 'function') await reagir('🔊')
              return reply(`🔊 @${String(target).split('@')[0]} foi liberado.`)
          } catch (e) {
            console.error('[unmute] Erro:', e.message)
            return reply(`❌ Erro ao liberar: ${e.message}`)
          }
  }
}
