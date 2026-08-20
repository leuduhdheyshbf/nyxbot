'use strict'

const db = require('../../core/database')
const { toJid, cleanNumber } = require('../../utils/helpers')

module.exports = {
  name: 'mutetempo',
  description: 'Silencia por X minutos',
  category: 'admin',
  aliases: ['tempmute', 'mutet'],

  async execute({ nyx, client, from, info, reply, reagir, isGroup, isAdm, isDono, args, sender }) {
    if (!isGroup) return reply('❌ Só em grupos.')
    if (!isAdm && !isDono) return reply('❌ Só admins.')

    const bot = nyx || client
    const quoted = info.message?.extendedTextMessage?.contextInfo
    let target = quoted?.participant || quoted?.mentionedJid?.[0]

    // .mutetempo 10 @pessoa  OU  .mutetempo @pessoa 10
    let min = parseInt(args[0], 10)
    if (!target && args[0] && String(args[0]).includes('@')) {
      target = args[0]
      min = parseInt(args[1], 10)
    }
    if (!target && args[1] && String(args[1]).includes('@')) {
      target = args[1]
    }
    if (!target && args[0]) {
      const n = cleanNumber(args[0])
      if (n && n.length >= 10) target = n + '@s.whatsapp.net'
    }
    target = toJid(target) || target

    if (!target) return reply('❗ Marque alguém: .mutetempo 10 @pessoa')
    if (!min || min < 1 || min > 1440) return reply('❗ Minutos entre 1 e 1440.\nEx: .mutetempo 10 @pessoa')

    const until = Date.now() + min * 60 * 1000
    await db.setMute(from, target, { by: sender, until, reason: 'mutetempo' })

    if (typeof reagir === 'function') await reagir('🔇')
    await bot.sendMessage(
      from,
      { text: `🔇 @${String(target).split('@')[0]} silenciado por *${min} min*`, mentions: [target] },
      { quoted: info }
    )

    setTimeout(async () => {
      try {
        await db.removeMute(from, target)
        await bot.sendMessage(from, {
          text: `🔊 @${String(target).split('@')[0]} pode falar de novo (tempo esgotado).`,
          mentions: [target]
        })
      } catch {}
    }, min * 60 * 1000)
  }
}
