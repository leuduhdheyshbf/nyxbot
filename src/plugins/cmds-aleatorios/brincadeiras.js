'use strict'

module.exports = {
  name: 'brincadeiras',
  description: 'Menu completo de brincadeiras (com imagem)',
  category: 'cmds-aleatorios',
  aliases: ['diversao', 'fun', 'entretenimento', 'brinks', 'brincar'],
  cooldown: 5,

  async execute({ reply, prefix }) {
    const p = prefix || '.'

    const msg = `
┏╾═╼°❀•° ⊱🩸⊰ °•❀°╾═╼┓
┃ ☠ 𝘽𝙍𝙄𝙉𝘾𝘼𝘿𝙀𝙄𝙍𝘼𝙎 ☠
┃ ▸ 𝙏𝙊𝘿𝘼𝙎 𝘾𝙊𝙈 𝙄𝙈𝘼𝙂𝙀𝙈
┗╾═╼°❀•°: | ⊱🦇⊰ | :°•❀°╾═╼┛

╭─━─━─━─━─━─━─━─╮
│ 🎲 𝙅𝙊𝙂𝙊𝙎
│  ${p}velha  ${p}forca  ${p}memoria
│  ${p}adivinha  ${p}quiz  ${p}dado
│  ${p}moeda  ${p}ppt  ${p}blackjack
│  ${p}batalha  ${p}bingo  ${p}roleta
│  ${p}cacaniquel  ${p}loteria  ${p}corrida
│  ${p}caracoroa  ${p}slot  ${p}dado20
│  ${p}ppt2  ${p}adivinha2  ${p}rpgstat
╰─━─━─━─━─━─━─━─╯

╭─━─━─━─━─━─━─━─╮
│ 💕 𝙄𝙉𝙏𝙀𝙍𝘼ÇÃ𝙊
│  ${p}abraco  ${p}beijo  ${p}tapa
│  ${p}chute  ${p}morder  ${p}carinho
│  ${p}elogiar  ${p}defender  ${p}xingar
│  ${p}provocar  ${p}beijar  ${p}abracar
│  ${p}socar  ${p}zoar  ${p}stalkear
│  ${p}trollar  ${p}hipnotizar  ${p}curar
│  ${p}desafiar  ${p}perdoar  ${p}trair
╰─━─━─━─━─━─━─━─╯

╭─━─━─━─━─━─━─━─╮
│ 📏 𝙈𝙀𝘿𝙄𝘿𝙊𝙍𝙀𝙎
│  ${p}gay  ${p}gaymeter  ${p}corno
│  ${p}burro  ${p}feio  ${p}lindo
│  ${p}forte  ${p}inteligente
│  ${p}pobre  ${p}rico  ${p}alto
│  ${p}gordo  ${p}magro  ${p}fome
│  ${p}sono  ${p}cafeina  ${p}chance
│  ${p}chato  ${p}sigma  ${p}cringe
│  ${p}otaku  ${p}gamer  ${p}nerd
│  ${p}fofo  ${p}ego  ${p}coragem
│  ${p}npc  ${p}viral  ${p}lendario
╰─━─━─━─━─━─━─━─╯

╭─━─━─━─━─━─━─━─╮
│ 🎲 𝘼𝙇𝙀𝘼𝙏Ó𝙍𝙄𝙊𝙎
│  ${p}cantada  ${p}verdade  ${p}piada
│  ${p}fato  ${p}conselho  ${p}8ball
│  ${p}escolha  ${p}resposta  ${p}zoeira
│  ${p}caixa  ${p}surpresa  ${p}confessar
│  ${p}sorteio  ${p}aleatorio  ${p}aleatorio100
│  ${p}frase  ${p}motivacao  ${p}simnao
│  ${p}quando  ${p}quem  ${p}percentual
│  ${p}escolher  ${p}duelo  ${p}desafio
╰─━─━─━─━─━─━─━─╯

╭─━─━─━─━─━─━─━─╮
│ 👥 𝙍𝘼𝙉𝙆 / 𝘾𝘼𝙎𝘼𝙇
│  ${p}casal  ${p}ship  ${p}top10
│  ${p}casalfalso  ${p}rankgay
│  ${p}rankburro  ${p}ranklindo
│  ${p}rankforte  ${p}rankcorno
│  ${p}rankinteligente  ${p}rankchato
│  ${p}ranksigma  ${p}ranknpc
│  ${p}rankgamer  ${p}rankotaku
╰─━─━─━─━─━─━─━─╯

╭─━─━─━─━─━─━─━─╮
│ 🎭 𝙍𝙊𝙇𝙀𝙋𝙇𝘼𝙔
│  ${p}imitar  ${p}animais  ${p}robo
│  ${p}bebe  ${p}velho  ${p}alien
│  ${p}pirata  ${p}celebridade
│  ${p}horoscopo  ${p}magia  ${p}energia
│  ${p}numerologia  ${p}espelho  ${p}invert
╰─━─━─━─━─━─━─━─╯

╭─━─━─━─━─━─━─━─╮
│ 🧩 𝙐𝙏𝙄𝙇 / 𝙀𝙓𝙏𝙍𝘼
│  ${p}base64  ${p}morse  ${p}hex
│  ${p}uuid  ${p}gerarsenha  ${p}horario
│  ${p}github  ${p}ipinfo  ${p}converter
│  ${p}fox  ${p}dog  ${p}cat  ${p}neko
╰─━─━─━─━─━─━─━─╯

✧ Voltar: *${p}menu*
✧ Tema: ⊱🩸 gótico / sombrio 🦇⊰
✧ Dica: nem todo comando cabe no menu — teste pelo nome
`.trim()

    await reply(msg)
  }
}
