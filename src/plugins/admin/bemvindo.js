'use strict'

// Importa o banco de dados (Supabase + JSON fallback)
const db = require('../../core/database')

module.exports = {
  name: 'bemvindo',
  originalName: 'bemvindo',
  description: 'Sistema de boas-vindas com foto de perfil (Las Vegas)',
  category: 'admin',
  aliases: ['boasvindas', 'welcome'],

  // ============================================
  // FUNÇÕES AUXILIARES (Exportadas para o groupUpdateHandler)
  // ============================================

  async isWelcomeEnabled(groupId) {
    try {
      // Lê do Supabase
      const { data, error } = await db.supabase
      .from('boas_vindas')
      .select('*')
      .eq('group_id', groupId)
      .maybeSingle()

      if (error) {
        console.error('[BemVindo] Erro no Supabase:', error.message)
        // Fallback: tenta ler do JSON local
        const local = require('fs').existsSync('./database/json/welcome.json') ?
        JSON.parse(require('fs').readFileSync('./database/json/welcome.json', 'utf8')) : { groups: [] }
        return local.groups.includes(groupId)
      }

      return data ? data.ativo === true : false
    } catch (err) {
      console.error('[BemVindo] Erro inesperado:', err.message)
      return false
    }
  },

  async setWelcome(groupId, enabled) {
    try {
      // Salva no Supabase
      const { error } = await db.supabase
      .from('boas_vindas')
      .upsert(
        { group_id: groupId, ativo: enabled },
        { onConflict: 'group_id' }
      )

      if (error) {
        console.error('[BemVindo] Erro ao salvar no Supabase:', error.message)
        // Fallback: salva no JSON local
        const local = require('fs').existsSync('./database/json/welcome.json') ?
        JSON.parse(require('fs').readFileSync('./database/json/welcome.json', 'utf8')) : { groups: [] }
        if (enabled) {
          if (!local.groups.includes(groupId)) local.groups.push(groupId)
        } else {
          local.groups = local.groups.filter((g) => g !== groupId)
        }
        require('fs').writeFileSync('./database/json/welcome.json', JSON.stringify(local, null, 2))
        return
      }
    } catch (err) {
      console.error('[BemVindo] Erro inesperado ao salvar:', err.message)
    }
  },

  async loadWelcome() {
    try {
      const { data, error } = await db.supabase
      .from('boas_vindas')
      .select('*')
      .eq('ativo', true)

      if (error) {
        console.error('[BemVindo] Erro ao ler lista:', error.message)
        return []
      }
      return data ? data.map((r) => r.group_id) : []
    } catch (err) {
      console.error('[BemVindo] Erro inesperado:', err.message)
      return []
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
