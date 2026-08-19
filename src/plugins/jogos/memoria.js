'use strict'

const { drawMemoria } = require('../../modules/games/imageBoard')
const { safeUnlink } = require('../../utils/helpers')

const FACES = ['🦇', '🩸', '🌙', '⭐', '🔮', '💀', '🕷', '🖤']
const jogos = new Map()

function embaralhar(arr) {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

module.exports = {
  name: 'memoria',
  description: '🃏 Jogo da memória com cartas em imagem',
  category: 'jogos',
  aliases: ['memory'],
  cooldown: 2,
  async execute(ctx) {
    const { from, sender, args, reply, sendImage, prefix } = ctx
    const key = `${from}:${sender}`
    const cmd = (args[0] || '').toLowerCase()

    if (cmd === 'sair') {
      jogos.delete(key)
      return reply('🚪 Memória encerrada.')
    }

    let jogo = jogos.get(key)
    if (!jogo || cmd === 'novo') {
      const pares = embaralhar([...FACES.slice(0, 4), ...FACES.slice(0, 4)])
      jogo = {
        cartas: pares.map((face) => ({ face, revelada: false, resolvida: false })),
        primeira: null,
        updated: Date.now()
      }
      jogos.set(key, jogo)
      const img = await drawMemoria(jogo.cartas)
      await sendImage(img, `🃏 *MEMÓRIA*\nUse: *${prefix}memoria [1-8]* duas vezes para virar o par`)
      safeUnlink(img)
      return
    }

    const pos = parseInt(args[0], 10) - 1
    if (isNaN(pos) || pos < 0 || pos >= jogo.cartas.length) {
      return reply(`Use: *${prefix}memoria [1-8]*`)
    }
    const carta = jogo.cartas[pos]
    if (carta.resolvida || carta.revelada) return reply('Carta já revelada.')

    carta.revelada = true

    if (jogo.primeira === null) {
      jogo.primeira = pos
      const img = await drawMemoria(jogo.cartas)
      await sendImage(img, 'Escolha a segunda carta.')
      safeUnlink(img)
      return
    }

    const p1 = jogo.primeira
    const c1 = jogo.cartas[p1]
    if (c1.face === carta.face) {
      c1.resolvida = true
      carta.resolvida = true
      jogo.primeira = null
      const img = await drawMemoria(jogo.cartas)
      const fim = jogo.cartas.every((c) => c.resolvida)
      await sendImage(img, fim ? '🎉 *Você completou a memória!*' : '✅ Par encontrado!')
      safeUnlink(img)
      if (fim) jogos.delete(key)
    } else {
      const img = await drawMemoria(jogo.cartas)
      await sendImage(img, '❌ Não é par...')
      safeUnlink(img)
      setTimeout(async () => {
        c1.revelada = false
        carta.revelada = false
        jogo.primeira = null
        try {
          const img2 = await drawMemoria(jogo.cartas)
          await sendImage(img2, `Continue: *${prefix}memoria [n]*`)
          safeUnlink(img2)
        } catch {}
      }, 1500)
    }
  }
}
