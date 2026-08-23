'use strict'

const db = require('../../core/database')

module.exports = {
  name: 'bemvindo',
  originalName: 'bemvindo',
  description: 'Sistema de boas-vindas com foto de perfil (Las Vegas)',
  category: 'admin',
  aliases: ['boasvindas', 'welcome'],

  // 🔥 SALVA SÓ NO SUPABASE
  async setWelcome(groupId, enabled) {
    try {
      const { error } = await db.supabase
      .from('boas_vindas')
      .upsert(
        { group_id: groupId, ativo: enabled },
        { onConflict: 'group_id' }
      )

      if (error) {
        console.error('[BemVindo] Erro no Supabase:', error.message)
        throw new Error('Erro ao salvar no Supabase')
      }

      console.log(`[BemVindo] ✅ Salvo no Supabase: ${groupId} = ${enabled}`)
    } catch (err) {
      console.error('[BemVindo] Erro:', err.message)
      throw err
    }
  },

  // 🔥 LÊ SÓ DO SUPABASE
  async isWelcomeEnabled(groupId) {
    try {
      const { data, error } = await db.supabase
      .from('boas_vindas')
      .select('*')
      .eq('group_id', groupId)
      .maybeSingle()

      if (error) {
        console.error('[BemVindo] Erro no Supabase:', error.message)
        return false
      }

      return data ? data.ativo === true : false
    } catch (err) {
      console.error('[BemVindo] Erro:', err.message)
      return false
    }
  },

  async execute({ client, from, info, args, reply, isAdm, isDono, isGroup, prefix, reagir }) {
    if (!isGroup) {
      return reply('❌ Este comando só pode ser usado em grupos!')
    }
    if (!isAdm && !isDono) {
      return reply('❌ Apenas administradores podem usar este comando!')
    }

    const sub = (args[0] || '').toLowerCase()

    // ============================================
    // ATIVAR
    // ============================================
    if (sub === 'on' || sub === '1' || sub === 'ativar') {
      const isOn = await this.isWelcomeEnabled(from)
      if (isOn) {
        return reply('🎰 O sistema de boas-vindas já está *ATIVADO* neste grupo!')
      }
      await this.setWelcome(from, true)
      if (typeof reagir === 'function') await reagir('✅')
        return reply(
          `🎰 *BOAS-VINDAS ATIVADAS!*\n\n` +
          `Quando um novo membro entrar, o bot enviará a mensagem de Las Vegas com a foto de perfil.\n\n` +
          `✅ *Salvo no Supabase!* Mesmo se o bot reiniciar, continuará ativo.\n` +
          `Use \`${prefix}bemvindo off\` para desativar.`
        )
    }

    // ============================================
    // DESATIVAR
    // ============================================
    if (sub === 'off' || sub === '0' || sub === 'desativar') {
      const isOn = await this.isWelcomeEnabled(from)
      if (!isOn) {
        return reply('❄️ O sistema de boas-vindas já está *DESATIVADO* neste grupo!')
      }
      await this.setWelcome(from, false)
      if (typeof reagir === 'function') await reagir('✅')
        return reply('❄️ *BOAS-VINDAS DESATIVADAS!*\n\nNão enviarei mais mensagens de entrada.')
    }

    // ============================================
    // STATUS
    // ============================================
    if (sub === 'status' || sub === 'info') {
      const ativo = await this.isWelcomeEnabled(from) ? '✅ ATIVADO' : '❌ DESATIVADO'
      return reply(
        `📊 *STATUS — BOAS-VINDAS*\n\n` +
        `🔘 Estado: ${ativo}\n\n` +
        `✅ *Salvo no Supabase, não se perde ao reiniciar!*\n\n` +
        `📌 Comandos:\n` +
        `▸ \`${prefix}bemvindo on\` — Ativar\n` +
        `▸ \`${prefix}bemvindo off\` — Desativar\n` +
        `▸ \`${prefix}bemvindo status\` — Ver status`
      )
    }

    // ============================================
    // AJUDA
    // ============================================
    const ativo = await this.isWelcomeEnabled(from) ? 'ATIVADO' : 'DESATIVADO'
    return reply(
      `🎰 *SISTEMA DE BOAS-VINDAS — LAS VEGAS*\n\n` +
      `Status atual: *${ativo}*\n\n` +
      `✅ *Salvo no Supabase, não se perde ao reiniciar!*\n\n` +
      `📌 *Uso:*\n` +
      `▸ \`${prefix}bemvindo on\` — Ativar no grupo\n` +
      `▸ \`${prefix}bemvindo off\` — Desativar no grupo\n` +
      `▸ \`${prefix}bemvindo status\` — Ver status\n\n` +
      `Quando ativo, novos membros recebem a mensagem temática com foto de perfil (ou imagem aleatória).`
    )
  }
}
