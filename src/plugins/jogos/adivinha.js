'use strict'

const { drawAdivinha } = require('../../modules/games/imageBoard')
const { safeUnlink } = require('../../utils/helpers')

const jogos = new Map()

module.exports = {
  name: 'adivinha',
  description: '🔮 Adivinhe o número (1-100) com imagem de dicas',
  category: 'jogos',
  aliases: ['adivinhar', 'guess'],
  cooldown: 2,
  async execute(ctx) {
    const { from, sender, args, reply, sendImage, prefix } = ctx
    const key = `${from}:${sender}`
    const arg = (args[0] || '').toLowerCase()

    if (arg === 'sair') {
      jogos.delete(key)
      return reply('🚪 Adivinha encerrado.')
    }

    let jogo = jogos.get(key)
    if (!jogo || arg === 'novo') {
      jogo = {
        numero: Math.floor(Math.random() * 100) + 1,
        tentativas: 0,
        max: 8
      }
      jogos.set(key, jogo)
      const img = await drawAdivinha({
        dica: '1 — 100',
        tentativas: 0,
        maxTentativas: 8
      })
      await sendImage(img, `🔮 *ADIVINHA*\nPensei em um número de 1 a 100.\nUse: *${prefix}adivinha [n]*`)
      safeUnlink(img)
      return
    }

    const n = parseInt(args[0], 10)
    if (isNaN(n) || n < 1 || n > 100) {
      return reply(`Digite um número 1-100: *${prefix}adivinha [n]*`)
    }

    jogo.tentativas++
    let dica = ''
    if (n === jogo.numero) {
      const img = await drawAdivinha({
        dica: `Era ${jogo.numero}!`,
        tentativas: jogo.tentativas,
        maxTentativas: jogo.max
      })
      await sendImage(img, `🎉 Acertou em ${jogo.tentativas} tentativa(s)!`)
      safeUnlink(img)
      jogos.delete(key)
      return
    }
    if (jogo.tentativas >= jogo.max) {
      const img = await drawAdivinha({
        dica: `Era ${jogo.numero}`,
        tentativas: jogo.tentativas,
        maxTentativas: jogo.max
      })
      await sendImage(img, `💀 Acabaram as tentativas. Era *${jogo.numero}*`)
      safeUnlink(img)
      jogos.delete(key)
      return
    }

    dica = n < jogo.numero ? 'MAIOR ⬆' : 'MENOR ⬇'
    const img = await drawAdivinha({
      dica,
      tentativas: jogo.tentativas,
      maxTentativas: jogo.max
    })
    await sendImage(img, `Dica: *${dica}*\n*${prefix}adivinha [n]*`)
    safeUnlink(img)
  }
}
