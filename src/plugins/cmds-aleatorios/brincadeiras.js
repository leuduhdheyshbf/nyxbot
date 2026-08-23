'use strict'

module.exports = {
  name: 'brincadeiras',
  description: 'Menu de brincadeiras em texto',
  category: 'cmds-aleatorios',
  aliases: ['jogos', 'diversao', 'fun', 'entretenimento', 'brinks', 'brincar'],
  cooldown: 3,

  async execute({ reply, prefix }) {
    const p = prefix || '.'

    const msg = `
┏╾═╼°❀•° ⊱🩸⊰ °•❀°╾═╼┓
┃ ☠ *BRINCADEIRAS* ☠
┃ ▸ *Nyx Bot V2*
┗╾═╼°❀•°: | ⊱🦇⊰ | :°•❀°╾═╼┛

╭─━─━─━─━─━─━─━─╮
│ 🎮 *JOGOS*
│  ${p}forca  ${p}adivinha  ${p}quiz
│  ${p}velha  ${p}memoria  ${p}corrida
│  ${p}ppt  ${p}dado  ${p}blackjack
│  ${p}batalha
╰─━─━─━─━─━─━─━─╯

╭─━─━─━─━─━─━─━─╮
│ 💕 *INTERAÇÃO*
│  ${p}abraco  ${p}beijo  ${p}tapa
│  ${p}chute  ${p}morder  ${p}carinho
│  ${p}elogiar  ${p}defender  ${p}xingar
│  ${p}provocar
╰─━─━─━─━─━─━─━─╯

╭─━─━─━─━─━─━─━─╮
│ 📏 *MEDIDORES*
│  ${p}gay  ${p}corno  ${p}burro
│  ${p}feio  ${p}lindo  ${p}forte
│  ${p}inteligente  ${p}pobre  ${p}rico
│  ${p}alto  ${p}gordo  ${p}magro
╰─━─━─━─━─━─━─━─╯

╭─━─━─━─━─━─━─━─╮
│ 🎲 *ALEATÓRIOS*
│  ${p}cantada  ${p}verdade  ${p}escolha
│  ${p}chance  ${p}sorteio  ${p}piada
│  ${p}fato  ${p}conselho  ${p}8ball
│  ${p}resposta
╰─━─━─━─━─━─━─━─╯

╭─━─━─━─━─━─━─━─╮
│ 👥 *RANK / CASAL*
│  ${p}casal  ${p}ship  ${p}top10
│  ${p}rankgay  ${p}rankburro
│  ${p}ranklindo  ${p}rankforte
│  ${p}rankcorno  ${p}rankinteligente
╰─━─━─━─━─━─━─━─╯

╭─━─━─━─━─━─━─━─╮
│ 🎭 *ROLEPLAY*
│  ${p}imitar  ${p}animais  ${p}robo
│  ${p}bebe  ${p}velho  ${p}alien
│  ${p}pirata  ${p}celebridade
╰─━─━─━─━─━─━─━─╯

╭─━─━─━─━─━─━─━─╮
│ 🔮 *ÚTIL / EXTRA*
│  ${p}horoscopo  ${p}signo  ${p}magia
│  ${p}energia  ${p}surpresa  ${p}invert
│  ${p}espelho  ${p}caixa  ${p}zoeira
│  ${p}numerologia
╰─━─━─━─━─━─━─━─╯

━━━━━━━━━━━━━━━━━━
🎉 Divirta-se com *Nyx*!
Use *${p}brincadeiras* novamente
Voltar: *${p}menu*
⊱🩸 gótico / sombrio 🦇⊰
`.trim()

    await reply(msg)
  }
}
