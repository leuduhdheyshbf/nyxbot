'use strict'

// Guarda os agendamentos na memória (se o bot reiniciar, perde o agendamento)
// Se quiser salvar no Supabase, podemos mudar depois, mas pra começar é simples assim.
const agendamentos = new Map()

module.exports = {
  name: 'agendafechar',
  originalName: 'agendafechar',
  description: 'Agenda o fechamento do grupo para um horário específico',
  category: 'admin',
  aliases: ['agendarfechar', 'lockat'],

  async execute({ client, from, args, reply, isAdm, isDono, isGroup, prefix, reagir }) {
    if (!isGroup) {
      return reply('❌ Este comando só funciona em grupos!')
    }
    if (!isAdm && !isDono) {
      return reply('❌ Apenas administradores podem usar este comando!')
    }

    const sub = (args[0] || '').toLowerCase()

    // =========================================================
    // CANCELAR AGENDAMENTO
    // =========================================================
    if (sub === 'cancelar' || sub === 'cancel') {
      if (!agendamentos.has(from)) {
        return reply('⏳ Não há nenhum agendamento de fechamento ativo para este grupo.')
      }

      // Cancela o setTimeout que estava agendado
      const timer = agendamentos.get(from)
      clearTimeout(timer)
      agendamentos.delete(from)

      await reagir('❌')
      return reply('⏳ *Agendamento de fechamento cancelado!*\nO grupo não será fechado automaticamente.')
    }

    // =========================================================
    // FECHAR AGORA (Manual)
    // =========================================================
    if (sub === 'agora') {
      try {
        await client.groupSettingUpdate(from, 'announcement')
        await client.groupSettingUpdate(from, 'restrict')
        await reagir('🔒')
        return reply('🔒 *Grupo fechado!* (Só admins podem enviar mensagens e alterar configurações).')
      } catch (err) {
        return reply(`❌ Erro ao fechar: ${err.message}`)
      }
    }

    // =========================================================
    // AGENDAR FECHAMENTO (Ex: .agendafechar 22:00)
    // =========================================================
    if (args.length >= 1 && /^\d{1,2}:\d{2}$/.test(args[0])) {
      const horario = args[0] // Ex: "22:00"
      const [horaStr, minutoStr] = horario.split(':')
      let hora = parseInt(horaStr)
      let minuto = parseInt(minutoStr)

      // Validação básica
      if (hora < 0 || hora > 23 || minuto < 0 || minuto > 59) {
        return reply('❌ Horário inválido! Use o formato HH:MM (ex: 22:00).')
      }

      // Calcula o tempo até o horário
      const agora = new Date()
      const alvo = new Date()
      alvo.setHours(hora, minuto, 0, 0) // Zera os segundos e milissegundos

      // Se o horário já passou hoje, agenda para AMANHÃ
      if (alvo.getTime() <= agora.getTime()) {
        alvo.setDate(alvo.getDate() + 1)
      }

      const msAteFechar = alvo.getTime() - agora.getTime()
      const horasAte = Math.floor(msAteFechar / (1000 * 60 * 60))
      const minutosAte = Math.floor((msAteFechar % (1000 * 60 * 60)) / (1000 * 60))

      // Se já houver um agendamento, cancela o antigo
      if (agendamentos.has(from)) {
        clearTimeout(agendamentos.get(from))
        agendamentos.delete(from)
      }

      // Agenda o fechamento
      const timer = setTimeout(async () => {
        try {
          await client.groupSettingUpdate(from, 'announcement')
          await client.groupSettingUpdate(from, 'restrict')
          await client.sendMessage(from, { text: '🔒 *HORA DO FECHAMENTO!*\nO grupo foi automaticamente fechado conforme agendado.' })
        } catch (e) {
          console.error(`Erro ao fechar grupo agendado (${from}):`, e.message)
        } finally {
          agendamentos.delete(from) // Remove da memória após executar
        }
      }, msAteFechar)

      agendamentos.set(from, timer)

      await reagir('⏳')
      return reply(
        `⏳ *FECHAMENTO AGENDADO!*\n\n` +
        `📅 Data/Hora: *${alvo.toLocaleDateString('pt-BR')} às ${horario}*\n` +
        `⏰ Faltam *${horasAte}h ${minutosAte}m* para o fechamento.\n\n` +
        `Use \`${prefix}agendafechar cancelar\` para cancelar.\n` +
        `Use \`${prefix}agendafechar agora\` para fechar manualmente agora.`
      )
    }

    // =========================================================
    // Ajuda / Menu
    // =========================================================
    return reply(
      `⏰ *AGENDAR FECHAMENTO*\n\n` +
      `Agende um horário para o bot fechar o grupo automaticamente.\n\n` +
      `📌 *Comandos:*\n` +
      `▸ \`${prefix}agendafechar 22:00\` — Agenda fechar às 22h\n` +
      `▸ \`${prefix}agendafechar agora\` — Fecha o grupo agora mesmo\n` +
      `▸ \`${prefix}agendafechar cancelar\` — Cancela o agendamento atual\n\n` +
      `⚠️ O bot precisa ser *admin* do grupo para fechar.`
    )
  }
}
