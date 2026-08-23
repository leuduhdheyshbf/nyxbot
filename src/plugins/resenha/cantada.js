'use strict'

/**
 * .cantada — cantada com imagem IA gótica + texto legível
 */

const fs = require('fs')
const { drawQuote } = require('../../modules/games/imageBoard')
const { safeUnlink } = require('../../utils/helpers')

const ITEMS = [
  'Você é Wi-Fi? Porque sinto a conexão.',
  'Seu nome é Google? Porque você tem tudo que eu procuro.',
  'Não sou fotógrafo, mas posso te imaginar comigo.',
  'Você acredita em amor à primeira vista ou preciso passar de novo?',
  'Se a beleza fosse tempo, você seria a eternidade.',
  'Me chama de GPS, porque você é o meu destino.',
  'Você é Wi-Fi? Porque quando você chega, todo mundo quer se conectar.',
  'Não sou cartão, mas posso fazer seu coração acelerar.',
  'Se eu fosse um gato, passaria as 9 vidas com você.',
  'Você é café? Porque me deixa acordado pensando em você.',
  'Perdi meu número… posso pegar o seu?',
  'Se beijo fosse código, o seu seria open source no meu coração.',
  'Você não é espelho, mas me vejo no seu olhar.',
  'Seus olhos têm Wi-Fi? Porque me conectei sem senha.',
  'Não sou meteorologista, mas tem um clima gostoso entre a gente.'
]

module.exports = {
  name: 'cantada',
  description: 'Manda uma cantada (imagem + texto completo)',
  category: 'resenha',
  aliases: ['paquera'],
  cooldown: 3,

  async execute({ client, from, info, reply, reagir }) {
    await reagir('💘')
    const text = ITEMS[Math.floor(Math.random() * ITEMS.length)]
    const caption = `💘 *Cantada*\n\n${text}`

    try {
      // exact:false → fundo IA bonito + texto canvas por cima
      const img = await drawQuote({ title: 'Cantada', emoji: '💘', text, exact: false })
      await client.sendMessage(
        from,
        { image: fs.readFileSync(img), caption },
        { quoted: info }
      )
      safeUnlink(img)
    } catch (e) {
      console.error('[cantada]', e.message)
      await reply(caption)
    }
  }
}
