'use strict'

const db = require('../../core/database')

module.exports = {
    name: 'agendafechar',
    originalName: 'agendafechar_cancelar',
    description: 'Cancela o agendamento de fechamento do grupo',
    category: 'admin',
    aliases: ['cancelarhora'],

    async execute({ from, reply, isAdm, isDono, isGroup, args, reagir }) {
        if (!isGroup) return reply('❌ Só em grupos!')
            if (!isAdm && !isDono) return reply('❌ Apenas administradores!')

                if (!args[0] || args[0].toLowerCase() !== 'cancelar') {
                    return // Ignora se não for o comando de cancelar
                }

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
}
