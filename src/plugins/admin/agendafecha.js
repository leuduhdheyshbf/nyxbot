'use strict'

// CORREÇÃO AQUI: Caminho corrigido para 3 níveis acima
const db = require('../../../core/database')

module.exports = {
    name: 'agendafechar',
    originalName: 'agendafechar',
    description: 'Agenda o fechamento do grupo (Não abre sozinho)',
    category: 'admin',
    aliases: ['fecharhora', 'locktime'],

    async execute({ client, from, args, reply, isAdm, isDono, isGroup, prefix, reagir }) {
        if (!isGroup) {
            return reply('❌ Este comando só funciona em grupos!')
        }
        if (!isAdm && !isDono) {
            return reply('❌ Apenas administradores podem usar este comando!')
        }

        // Ajuda (sem argumentos)
        if (args.length < 1) {
            return reply(
                `⏰ *AGENDAR FECHAMENTO*\n\n` +
                `Use: \`${prefix}agendafechar <HH:MM>\`\n\n` +
                `Exemplos:\n` +
                `▸ \`${prefix}agendafechar 23:59\` → Fecha às 23:59\n` +
                `▸ \`${prefix}agendafechar cancelar\` → Cancela agendamento\n\n` +
                `⚠️ O bot precisa ser admin do grupo!`
            )
        }

        const sub = args[0].toLowerCase()

        // CANCELAR
        if (sub === 'cancelar' || sub === 'cancel') {
            try {
                const { data, error } = await db.supabase
                .from('agendamentos_fechar')
                .delete()
                .eq('group_id', from)
                .select()

                if (error) {
                    console.error('[Cancelar] Erro no Supabase:', error.message)
                    return reply('❌ Erro ao cancelar o agendamento.')
                }

                if (!data || data.length === 0) {
                    return reply('⏳ Não há nenhum agendamento ativo para este grupo.')
                }

                await reagir('❌')
                return reply('❌ *AGENDAMENTO CANCELADO!*\n\nO grupo não será mais fechado automaticamente.')
            } catch (err) {
                return reply('❌ Erro inesperado ao cancelar.')
            }
        }

        // AGENDAR
        const horario = args[0]

        if (!/^\d{1,2}:\d{2}$/.test(horario)) {
            return reply('❌ Horário inválido! Use o formato HH:MM (ex: 23:21).')
        }

        const [h, m] = horario.split(':').map(Number)
        if (h < 0 || h > 23 || m < 0 || m > 59) {
            return reply('❌ Horário inválido! Use horas entre 00 e 23, minutos entre 00 e 59.')
        }

        // Verifica se o horário já passou hoje
        const agora = new Date()
        const alvo = new Date()
        alvo.setHours(h, m, 0, 0)
        if (alvo.getTime() <= agora.getTime()) {
            alvo.setDate(alvo.getDate() + 1)
        }

        // Salva no Supabase
        try {
            const { error } = await db.supabase
            .from('agendamentos_fechar')
            .upsert({
                group_id: from,
                horario_fechar: horario,
                minutos_abrir: 0 // Força 0 para NUNCA abrir sozinho
            }, { onConflict: 'group_id' })

            if (error) {
                console.error('[Agendamento] Erro ao salvar no Supabase:', error.message)
                return reply('❌ Erro ao salvar o agendamento no banco de dados.')
            }

            const msAteFechar = alvo.getTime() - Date.now()
            const horasAte = Math.floor(msAteFechar / (1000 * 60 * 60))
            const minutosAte = Math.floor((msAteFechar % (1000 * 60 * 60)) / (1000 * 60))

            await reagir('⏳')

            return reply(
                `⏳ *FECHAMENTO AGENDADO!*\n\n` +
                `📅 Horário de fechamento: *${horario}* (em ${horasAte}h ${minutosAte}m)\n` +
                `🔒 *O grupo NÃO abrirá sozinho.*\n\n` +
                `✅ *Salvo no Supabase!* Mesmo se o bot reiniciar, ele vai lembrar.\n` +
                `Para abrir, use \`${prefix}abrir\` (ou comando de abrir do grupo).`
            )

        } catch (err) {
            console.error('[Agendamento] Erro inesperado:', err.message)
            return reply('❌ Erro inesperado ao salvar o agendamento.')
        }
    }
}
