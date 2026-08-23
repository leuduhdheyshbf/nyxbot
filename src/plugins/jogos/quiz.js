'use strict'

const { drawQuiz } = require('../../modules/games/imageBoard')
const { safeUnlink, pick } = require('../../utils/helpers')

const PERGUNTAS = [
  {
    q: 'Qual o planeta conhecido como Planeta Vermelho?',
    op: ['Marte', 'Vênus', 'Júpiter', 'Saturno'],
    a: 0
  },
  {
    q: 'Em que continente fica o Egito?',
    op: ['Ásia', 'África', 'Europa', 'América'],
    a: 1
  },
  {
    q: 'Quantos lados tem um hexágono?',
    op: ['5', '6', '7', '8'],
    a: 1
  },
  {
    q: 'Quem escreveu Dom Casmurro?',
    op: ['Machado de Assis', 'Clarice Lispector', 'Drummond', 'Alencar'],
    a: 0
  },
  {
    q: 'Qual o elemento químico do ouro?',
    op: ['Ag', 'Au', 'Fe', 'Cu'],
    a: 1
  }
]

const sessoes = new Map()

module.exports = {
  name: 'quiz',
  description: '🧠 Quiz com imagem da pergunta',
  category: 'jogos',
  aliases: ['trivia'],
  cooldown: 3,
  async execute(ctx) {
    const { from, sender, args, reply, sendImage, prefix } = ctx
    const key = `${from}:${sender}`
    const arg = (args[0] || '').toUpperCase()

    if (sessoes.has(key) && arg) {
      const s = sessoes.get(key)
      const idx = arg.charCodeAt(0) - 65
      sessoes.delete(key)
      if (idx === s.a) return reply('✅ *Acertou!*')
      return reply(`❌ Errou. Resposta: *${s.op[s.a]}*`)
    }

    const p = pick(PERGUNTAS)
    sessoes.set(key, p)
    setTimeout(() => sessoes.delete(key), 120000)

    const img = await drawQuiz({ pergunta: p.q, opcoes: p.op })
    await sendImage(
      img,
      `🧠 *QUIZ*\nResponda com: *${prefix}quiz A/B/C/D*`
    )
    safeUnlink(img)
  }
}
