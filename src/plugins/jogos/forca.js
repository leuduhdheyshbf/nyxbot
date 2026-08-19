'use strict'

const { drawForca } = require('../../modules/games/imageBoard')
const { safeUnlink, pick } = require('../../utils/helpers')

const jogos = new Map()
const TTL = 15 * 60 * 1000

const PALAVRAS = [
  'vampiro', 'sangue', 'trevas', 'lua', 'corvo', 'castelo', 'fantasma',
  'bruxa', 'pocao', 'grimorio', 'abismo', 'nevoa', 'cripta', 'esqueleto',
  'nyx', 'sombra', 'noite', 'magia', 'ritual', 'altar'
]

function mascara(palavra, certas) {
  return palavra
    .split('')
    .map((c) => (certas.has(c) ? c : '_'))
    .join('')
}

module.exports = {
  name: 'forca',
  description: '🪢 Jogo da forca com imagem',
  category: 'jogos',
  aliases: ['hangman'],
  cooldown: 2,
  async execute(ctx) {
    const { from, sender, args, reply, sendImage, prefix } = ctx
    const key = `${from}:${sender}`
    const letra = (args[0] || '').toLowerCase()

    if (letra === 'sair') {
      jogos.delete(key)
      return reply('🚪 Forca encerrada.')
    }

    let jogo = jogos.get(key)
    if (!jogo || letra === 'novo') {
      const palavra = pick(PALAVRAS)
      jogo = {
        palavra,
        certas: new Set(),
        erradas: new Set(),
        updated: Date.now()
      }
      jogos.set(key, jogo)
      const img = await drawForca({
        erros: 0,
        palavraMascarada: mascara(palavra, jogo.certas),
        letrasUsadas: []
      })
      await sendImage(
        img,
        `🪢 *FORCA*\n\nDigite: *${prefix}forca [letra]*\nSair: *${prefix}forca sair*`
      )
      safeUnlink(img)
      return
    }

    if (Date.now() - jogo.updated > TTL) {
      jogos.delete(key)
      return reply('⏰ Jogo expirou. Comece com `' + prefix + 'forca novo`')
    }

    if (!letra || letra.length !== 1 || !/[a-z]/.test(letra)) {
      return reply(`Use: *${prefix}forca [a-z]*`)
    }
    if (jogo.certas.has(letra) || jogo.erradas.has(letra)) {
      return reply('Essa letra já foi usada.')
    }

    if (jogo.palavra.includes(letra)) {
      jogo.certas.add(letra)
    } else {
      jogo.erradas.add(letra)
    }
    jogo.updated = Date.now()

    const erros = jogo.erradas.size
    const masc = mascara(jogo.palavra, jogo.certas)
    const usadas = [...jogo.certas, ...jogo.erradas]
    const img = await drawForca({
      erros,
      palavraMascarada: masc,
      letrasUsadas: usadas
    })

    if (!masc.includes('_')) {
      await sendImage(img, `🎉 *Acertou!* A palavra era *${jogo.palavra}*`)
      jogos.delete(key)
    } else if (erros >= 6) {
      await sendImage(img, `💀 *Enforcado!* A palavra era *${jogo.palavra}*`)
      jogos.delete(key)
    } else {
      await sendImage(img, `Continue: *${prefix}forca [letra]*`)
    }
    safeUnlink(img)
  }
}
