'use strict'

/**
 * Grimório — menu de comandos por categoria (dinâmico).
 * Não substitui .brincadeiras / .menu
 *
 * Uso: .grimorio
 *      .grimorio resenha
 *      .grimorio 2
 */

module.exports = {
  name: 'grimorio',
  description: 'Grimório: lista comandos por categoria',
  category: 'cmds-aleatorios',
  aliases: ['grim', 'grimório', 'tome', 'catalogo', 'catálogo'],
  cooldown: 4,

  async execute({ reply, prefix, args, cmdManager }) {
    const p = prefix || '.'

    const ordem = [
      'resenha',
      'jogos',
      'trabalho',
      'estudo',
      'financas',
      'saude',
      'utilidades',
      'cmds-aleatorios',
      'admin',
      'dono',
      'downloads',
      'midias',
      'efeitos',
      'infos',
      'adulto'
    ]

    let all = []
    try {
      all = typeof cmdManager?.allUnique === 'function' ? cmdManager.allUnique() : []
    } catch {
      all = []
    }

    if (!all.length) {
      return reply(
        `🩸 *Grimório*\n\n` +
          `Não consegui ler a lista de comandos.\n` +
          `Reinicie o bot e tente de novo.\n\n` +
          `Enquanto isso, teste:\n` +
          `${p}chato  ${p}sigma  ${p}slot  ${p}base64  ${p}fox`
      )
    }

    const byCat = {}
    for (const cmd of all) {
      if (cmd.isAlias) continue
      const cat = (cmd.category || 'outros').toLowerCase()
      if (!byCat[cat]) byCat[cat] = []
      byCat[cat].push(cmd.name)
    }
    for (const cat of Object.keys(byCat)) {
      byCat[cat].sort((a, b) => a.localeCompare(b))
    }

    const cats = [
      ...ordem.filter((c) => byCat[c]?.length),
      ...Object.keys(byCat)
        .filter((c) => !ordem.includes(c))
        .sort()
    ]

    const filtro = (args[0] || '').toLowerCase()

    if (filtro && byCat[filtro]) {
      const names = byCat[filtro]
      const lines = chunkNames(names, p, 5)
      return reply(
        header() +
          `\n📂 *${filtro.toUpperCase()}* (${names.length})\n\n` +
          lines.join('\n') +
          `\n\n✧ Voltar: *${p}grimorio*\n✧ Tema: ⊱🩸 gótico / sombrio 🦇⊰`
      )
    }

    if (!filtro) {
      let body = header()
      body += `\n📦 *Total de comandos:* ${all.filter((c) => !c.isAlias).length}\n`
      body += `📂 *Categorias:* ${cats.length}\n\n`

      for (const cat of cats) {
        const n = byCat[cat].length
        body += `▸ *${cat}* — ${n} cmd(s) → \`${p}grimorio ${cat}\`\n`
      }

      body += `\n╭─━─━─━─━─━─━─━─╮\n`
      body += `│ Atalhos rápidos\n`
      body += `│  ${p}chato  ${p}sigma  ${p}duelo\n`
      body += `│  ${p}slot  ${p}base64  ${p}fox\n`
      body += `│  ${p}neko  ${p}github  ${p}runtime\n`
      body += `╰─━─━─━─━─━─━─━─╯\n`
      body += `\n✧ Uso: *${p}grimorio <categoria>*\n`
      body += `✧ Ex: *${p}grimorio resenha*\n`
      body += `✧ Voltar: *${p}menu*`

      return reply(body.trim())
    }

    const page = parseInt(filtro, 10)
    if (!isNaN(page) && page >= 1) {
      const idx = page - 1
      if (idx >= cats.length) {
        return reply(`❌ Página inválida. Use 1 até ${cats.length}.`)
      }
      const cat = cats[idx]
      const names = byCat[cat]
      const lines = chunkNames(names, p, 5)
      return reply(
        header() +
          `\n📄 Página *${page}/${cats.length}* — *${cat}* (${names.length})\n\n` +
          lines.join('\n') +
          `\n\n✧ Próxima: *${p}grimorio ${page + 1 < cats.length ? page + 1 : 1}*\n` +
          `✧ Índice: *${p}grimorio*`
      )
    }

    return reply(
      `❌ Categoria *${filtro}* não encontrada.\n` +
        `Use *${p}grimorio* para ver as categorias.`
    )
  }
}

function header() {
  return `
┏╾═╼°❀•° ⊱🩸⊰ °•❀°╾═╼┓
┃ ✧ 𝙂𝙍𝙄𝙈Ó𝙍𝙄𝙊 ✧
┃ ▸ o livro de comandos
┗╾═╼°❀•°: | ⊱🦇⊰ | :°•❀°╾═╼┛
`.trim()
}

function chunkNames(names, prefix, perLine) {
  const lines = []
  for (let i = 0; i < names.length; i += perLine) {
    const slice = names.slice(i, i + perLine).map((n) => `${prefix}${n}`)
    lines.push(slice.join('  '))
  }
  return lines
}
