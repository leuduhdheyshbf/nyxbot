'use strict'

const fs = require('fs')
const path = require('path')
const chokidar = require('chokidar')
const { CyanLog, RedLog, YellowLog } = require('./logger')
const { setCooldown, getCooldownRemaining } = require('./cache')
const db = require('./database')
const { toJid, cleanNumber } = require('../utils/helpers')

const PLUGINS_DIR = path.join(__dirname, '..', 'plugins')

class CommandManager {
  constructor(config) {
    this.config = config
    this.commands = new Map()
    this.categories = []
  }

  carregarPlugins() {
    this.commands.clear()
    this.categories = []
    let total = 0

    if (!fs.existsSync(PLUGINS_DIR)) {
      fs.mkdirSync(PLUGINS_DIR, { recursive: true })
      return
    }

    const pastas = fs.readdirSync(PLUGINS_DIR).filter((p) => {
      return fs.statSync(path.join(PLUGINS_DIR, p)).isDirectory()
    })

    this.categories = pastas

    for (const cat of pastas) {
      const dir = path.join(PLUGINS_DIR, cat)
      const files = fs.readdirSync(dir).filter((f) => f.endsWith('.js'))
      for (const file of files) {
        const full = path.join(dir, file)
        try {
          delete require.cache[require.resolve(full)]
          const plugin = require(full)
          if (!plugin?.name || typeof plugin.execute !== 'function') {
            RedLog(`Plugin inválido: ${cat}/${file}`)
            continue
          }
          const entry = {
            ...plugin,
            category: plugin.category || cat,
            file: full,
            cooldown: plugin.cooldown ?? this.config.cooldownPadrao ?? 3,
            premium: !!plugin.premium,
            admin: !!plugin.admin,
            dono: !!plugin.dono,
            needBotAdmin: !!plugin.needBotAdmin
          }
          this.commands.set(plugin.name.toLowerCase(), entry)
          if (Array.isArray(plugin.aliases)) {
            for (const a of plugin.aliases) {
              if (!this.commands.has(a.toLowerCase())) {
                this.commands.set(a.toLowerCase(), {
                  ...entry,
                  name: a.toLowerCase(),
                  isAlias: true,
                  originalName: plugin.name
                })
              }
            }
          }
          total++
        } catch (e) {
          RedLog(`Erro ao carregar ${cat}/${file}: ${e.message}`)
        }
      }
    }

    CyanLog(`🌸 Comandos carregados: ${total} (${this.commands.size} com aliases)`)
  }

  watch() {
    if (!fs.existsSync(PLUGINS_DIR)) return
    const watcher = chokidar.watch(PLUGINS_DIR, {
      persistent: true,
      ignoreInitial: true,
      depth: 5,
      awaitWriteFinish: true
    })
    const reload = (fp) => {
      if (!fp.endsWith('.js')) return
      CyanLog(`🔄 Plugin alterado: ${path.basename(fp)}`)
      this.carregarPlugins()
    }
    watcher.on('add', reload)
    watcher.on('change', reload)
    watcher.on('unlink', () => this.carregarPlugins())
  }

  get(name) {
    if (!name) return null
    return this.commands.get(String(name).toLowerCase()) || null
  }

  listByCategory(cat) {
    return [...this.commands.values()].filter(
      (c) => c.category === cat && !c.isAlias
    )
  }

  allUnique() {
    return [...this.commands.values()].filter((c) => !c.isAlias)
  }

  /**
   * Verifica permissões e cooldown.
   * Retorna { ok: true } ou { ok: false, reason: string }
   */
  canRun(cmd, ctx) {
    const { sender, isDono, isAdmin, isBotAdmin, from } = ctx

    if (cmd.dono && !isDono) {
      return { ok: false, reason: '🔒 Apenas o dono pode usar este comando.' }
    }
    if (cmd.admin && !isAdmin && !isDono) {
      return { ok: false, reason: '🔒 Apenas administradores.' }
    }
    if (cmd.needBotAdmin && !isBotAdmin) {
      return { ok: false, reason: '🤖 Preciso ser admin do grupo.' }
    }
    if (cmd.premium) {
      const donoJid = toJid(this.config.NumeroDoDono)
      if (!db.isPremium(sender, [donoJid]) && !isDono) {
        return { ok: false, reason: '💎 Comando exclusivo para premium.' }
      }
    }

    // Cooldown (dono isento)
    if (!isDono) {
      const key = `${sender}:${cmd.originalName || cmd.name}`
      const left = getCooldownRemaining(key)
      if (left > 0) {
        return { ok: false, reason: `⏳ Aguarde ${left}s para usar novamente.` }
      }
      setCooldown(key, cmd.cooldown || 3)
    }

    return { ok: true }
  }
}

module.exports = CommandManager
