'use strict'

const fs = require('fs')
const { drawBrincadeirasMenu } = require('../../modules/games/imageBoard')
const { safeUnlink } = require('../../utils/helpers')

module.exports = {
  name: 'brincadeiras',
  description: 'Menu completo de brincadeiras (com imagem)',
  category: 'cmds-aleatorios',
  aliases: ['diversao', 'fun', 'entretenimento', 'brinks', 'brincar'],
  cooldown: 5,

  async execute({ client, from, info, reply, reagir, prefix }) {
    const p = prefix || '.'

    await reagir('🦇')

    const sections = [
      {
        title: 'Jogos',
        emoji: '🎲',
        cmds: [
          'velha', 'forca', 'memoria', 'adivinha', 'quiz', 'dado',
          'moeda', 'ppt', 'blackjack', 'batalha', 'bingo', 'roleta',
          'cacaniquel', 'loteria', 'corrida', 'caracoroa', 'slot', 'dado20'
        ]
      },
      {
        title: 'Interação',
        emoji: '💕',
        cmds: [
          'abraco', 'beijo', 'tapa', 'chute', 'morder', 'carinho',
          'elogiar', 'defender', 'xingar', 'provocar', 'socar', 'zoar',
          'stalkear', 'trollar', 'hipnotizar', 'curar', 'desafiar', 'trair'
        ]
      },
      {
        title: 'Medidores',
        emoji: '📏',
        cmds: [
          'gay', 'corno', 'burro', 'feio', 'lindo', 'forte',
          'inteligente', 'pobre', 'rico', 'alto', 'gordo', 'magro',
          'fome', 'sono', 'cafeina', 'chance', 'chato', 'sigma',
          'cringe', 'otaku', 'gamer', 'nerd', 'fofo', 'ego',
          'coragem', 'npc', 'viral', 'lendario'
        ]
      },
      {
        title: 'Aleatórios',
        emoji: '✨',
        cmds: [
          'cantada', 'verdade', 'piada', 'fato', 'conselho', '8ball',
          'escolha', 'zoeira', 'caixa', 'surpresa', 'confessar', 'sorteio',
          'frase', 'motivacao', 'simnao', 'quando', 'quem', 'duelo'
        ]
      },
      {
        title: 'Rank / Casal',
        emoji: '👥',
        cmds: [
          'casal', 'ship', 'top10', 'casalfalso', 'rankgay', 'rankburro',
          'ranklindo', 'rankforte', 'rankcorno', 'rankinteligente',
          'rankchato', 'ranksigma', 'ranknpc', 'rankgamer', 'rankotaku'
        ]
      },
      {
        title: 'Roleplay',
        emoji: '🎭',
        cmds: [
          'imitar', 'animais', 'robo', 'bebe', 'velho', 'alien',
          'pirata', 'celebridade', 'horoscopo', 'magia', 'energia',
          'numerologia', 'espelho', 'invert'
        ]
      },
      {
        title: 'Util / Extra',
        emoji: '🧩',
        cmds: [
          'base64', 'morse', 'hex', 'uuid', 'gerarsenha', 'horario',
          'github', 'ipinfo', 'converter', 'fox', 'dog', 'cat', 'neko'
        ]
      }
    ]

    const caption =
      `☠ *BRINCADEIRAS — Nyx Bot*\n` +
      `━━━━━━━━━━━━━━━━━━\n` +
      `Toque num comando ou digite:\n` +
      `*${p}comando*\n\n` +
      `✧ Voltar: *${p}menu*\n` +
      `✧ Tema: ⊱🩸 gótico / sombrio 🦇⊰`

    try {
      const imgPath = await drawBrincadeirasMenu({ prefix: p, sections })
      await client.sendMessage(
        from,
        {
          image: fs.readFileSync(imgPath),
          caption
        },
        { quoted: info }
      )
      safeUnlink(imgPath)
    } catch (e) {
      console.error('[brincadeiras]', e.message)
      // fallback texto compacto
      let txt = `☠ *BRINCADEIRAS*\n\n`
      for (const s of sections) {
        txt += `${s.emoji} *${s.title}*\n`
        txt += s.cmds.map((c) => p + c).join('  ') + '\n\n'
      }
      txt += `✧ Voltar: *${p}menu*`
      await reply(txt)
    }
  }
}
