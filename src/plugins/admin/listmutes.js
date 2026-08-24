'use strict'

const db = require('../../core/database')
const { toJid, cleanNumber } = require('../../utils/helpers')

module.exports = {
    name: 'mute',
    description: 'Silencia um membro (apaga msgs dele)',
    category: 'admin',
    aliases: ['silenciar'],
    admin: true,

    async execute({ from, info, reply, reagir, isGroup, isAdm, isDono, args, sender, sock }) {
        if (!isGroup) return reply('❌ Só em grupos.')
            if (!isAdm && !isDono) return reply('❌ Só admins.')

                const quoted = info.message?.extendedTextMessage?.contextInfo
                let target = quoted?.participant || quoted?.mentionedJid?.[0]

                if (!target && args[0]) {
                    const n = cleanNumber(args[0])
                    if (n) target = n + '@s.whatsapp.net'
                }
                target = toJid(target) || target

                if (!target) return reply('❗ Marque ou responda alguém.\nEx: .mute @pessoa')

                    // Não pode mutar admins ou dono
                    const groupMeta = await sock.groupMetadata(from)
                    const admins = groupMeta.participants.filter(p => p.admin).map(p => p.id)
                    if (admins.includes(target)) {
                        return reply('❌ Não é possível silenciar um administrador.')
                    }

                    // Salva no banco
                    try {
                        await db.setMute(from, target, {
                            by: sender,
                            reason: 'mute',
                            until_ts: null // mute permanente
                        })

                        // Força o cache a recarregar
                        if (typeof db.hydrateAll === 'function') {
                            await db.hydrateAll()
                        }

                        if (typeof reagir === 'function') await reagir('🔇')
                            return reply(`🔇 @${String(target).split('@')[0]} foi silenciado.\nUse .unmute para liberar.`)
                    } catch (e) {
                        console.error('[mute] Erro:', e.message)
                        return reply(`❌ Erro ao silenciar: ${e.message}`)
                    }
    }
}
