'use strict'

/**
 * Menu Gótico Estilizado — Nyx Bot V2
 * Estilo: ⊱🩸 Dark Gothic 🦇⊰
 * Com Painel do Sistema e informações do usuário
 */

const fs = require('fs')
const path = require('path')

const ROOT = path.join(__dirname, '..', '..', '..')
const CANDIDATES = [
  path.join(ROOT, 'src', 'assets', 'menu-bg.jpg'),
  path.join(ROOT, 'src', 'assets', 'menu-bg.jpeg'),
  path.join(__dirname, '..', '..', 'assets', 'menu-bg.jpg'),
  path.join(__dirname, '..', '..', 'assets', 'menu-bg.jpeg'),
  path.join(ROOT, 'arquivos', 'imagem', 'menu.jpg')
]

module.exports = {
  name: 'menu',
  description: 'Menu gótico estilizado com painel do sistema',
  category: 'cmds-aleatorios',
  aliases: ['help', 'ajuda', 'commands', 'comandos'],
  cooldown: 4,

  async execute({ client, from, info, prefix, reply, cmdManager, config }) {
    const p = prefix || '.'
    const total = cmdManager?.allUnique?.()?.length || '—'
    const botName = config?.NomeDoBot || 'Nyx Bot'
    const pushname = info.pushName || 'Usuário'
    const sender = info.key.participant || info.key.remoteJid || 'Desconhecido'

    // Pegando o ping (latência)
    const start = Date.now()
    const ping = Date.now() - start

    // Simulando VIP, Cargo e Dono (você pode substituir pelos dados reais do seu banco)
    const vipStatus = '❌' // ou '✅'
    const cargo = 'Membro'
    const ownerName = 'LCSX'

    const caption = `
    ┏╾═╼°❀•° ⊱🩸⊰ °•❀°╾═╼┓
    ┃ ✧ 𝙒𝙀𝙇𝘾𝙊𝙈𝙀 𝙏𝙊 𝙈𝙀𝙉𝙐 ✧
    ┃    ${botName.toUpperCase()}
    ┗╾═╼°❀•°: | ⊱🦇⊰ | :°•❀°╾═╼┛

    ├╾═╼･ﾟ𖤐ﾟ･｡👑｡･ﾟ𖤐ﾟ･╾═╼┓
    ┃╭╾═╼〔 • 👑 • 〕╾═╼╮
    ┃╎ ✧･ﾟ:* 𝐏𝐀𝐈𝐍𝐄𝐋 𝐃𝐎 𝐒𝐈𝐒𝐓𝐄𝐌𝐀 *:･ﾟ✧
    ┃╎
    ┃╎ ➮ 👤 𝐔𝐬𝐮𝐚𝐫𝐢𝐨: @${pushname}
    ┃╎ ➮ 💎 𝐕𝐈𝐏: ${vipStatus}
    ┃╎ ➮ 👑 𝐂𝐚𝐫𝐠𝐨: ${cargo}
    ┃╎ ➮ 👑 𝐃𝐨𝐧𝐨: ${ownerName}
    ┃╎ ➮ 🤖 𝐁𝐨𝐭: ${botName}
    ┃╎ ➮ ⚡ 𝐏𝐫𝐞𝐟𝐢𝐱𝐨: ${p}
    ┃╎ ➮ 🚀 𝐏𝐢𝐧𝐠: ${ping} ms
    ┃╎ ➮ 📦 𝐁𝐚𝐢𝐥𝐞𝐲𝐬: 7.0.0-rc13
    ┃╎ ➮ ⏳ 𝐔𝐩𝐭𝐢𝐦𝐞: 51 ᴍɪɴ
    ┃╎ ➮ 🔒 𝐌𝐨𝐝𝐨 𝐌𝐞𝐦𝐛𝐫𝐨: Sim ✅
    ┃╎
    ┃╰╾═╼〔 • 👑 • 〕╾═╼╯
    ├╾═╼･ﾟ𖤐ﾟ･｡👑｡･ﾟ𖤐ﾟ･╾═╼┛

    ├╾═╼･ﾟ𖤐ﾟ･｡🎮｡･ﾟ𖤐ﾟ･╾═╼┓
    ┃╭╾═╼〔 • 🎮 • 〕╾═╼╮
    ┃╎ ✧ ${p}velha
    ┃╎ ✧ ${p}forca
    ┃╎ ✧ ${p}memoria
    ┃╎ ✧ ${p}adivinha
    ┃╎ ✧ ${p}quiz
    ┃╎ ✧ ${p}dado
    ┃╎ ✧ ${p}moeda
    ┃╰╾═╼〔 • 🎮 • 〕╾═╼╯
    ├╾═╼･ﾟ𖤐ﾟ･｡🎮｡･ﾟ𖤐ﾟ･╾═╼┛

    ├╾═╼･ﾟ𖤐ﾟ･｡🩸｡･ﾟ𖤐ﾟ･╾═╼┓
    ┃╭╾═╼〔 • 🩸 • 〕╾═╼╮
    ┃╎ ✧ ${p}daily
    ┃╎ ✧ ${p}saldo
    ┃╎ ✧ ${p}loja
    ┃╎ ✧ ${p}rank
    ┃╎ ✧ ${p}perfil
    ┃╎ ✧ ${p}level
    ┃╰╾═╼〔 • 🩸 • 〕╾═╼╯
    ├╾═╼･ﾟ𖤐ﾟ･｡🩸｡･ﾟ𖤐ﾟ･╾═╼┛

    ├╾═╼･ﾟ𖤐ﾟ･｡💕｡･ﾟ𖤐ﾟ･╾═╼┓
    ┃╭╾═╼〔 • 💕 • 〕╾═╼╮
    ┃╎ ✧ ${p}abraco
    ┃╎ ✧ ${p}beijo
    ┃╎ ✧ ${p}tapa
    ┃╎ ✧ ${p}chute
    ┃╎ ✧ ${p}carinho
    ┃╎ ✧ ${p}defender
    ┃╎ ✧ ${p}elogiar
    ┃╰╾═╼〔 • 💕 • 〕╾═╼╯
    ├╾═╼･ﾟ𖤐ﾟ･｡💕｡･ﾟ𖤐ﾟ･╾═╼┛

    ├╾═╼･ﾟ𖤐ﾟ･｡📥｡･ﾟ𖤐ﾟ･╾═╼┓
    ┃╭╾═╼〔 • 📥 • 〕╾═╼╮
    ┃╎ ✧ ${p}play
    ┃╎ ✧ ${p}ytmp4
    ┃╎ ✧ ${p}tiktok
    ┃╎ ✧ ${p}instagram
    ┃╎ ✧ ${p}pinterest
    ┃╰╾═╼〔 • 📥 • 〕╾═╼╯
    ├╾═╼･ﾟ𖤐ﾟ･｡📥｡･ﾟ𖤐ﾟ･╾═╼┛

    ├╾═╼･ﾟ𖤐ﾟ･｡🎨｡･ﾟ𖤐ﾟ･╾═╼┓
    ┃╭╾═╼〔 • 🎨 • 〕╾═╼╮
    ┃╎ ✧ ${p}sticker
    ┃╎ ✧ ${p}toimg
    ┃╎ ✧ ${p}tomp3
    ┃╎ ✧ ${p}removebg
    ┃╎ ✧ ${p}blur
    ┃╰╾═╼〔 • 🎨 • 〕╾═╼╯
    ├╾═╼･ﾟ𖤐ﾟ･｡🎨｡･ﾟ𖤐ﾟ･╾═╼┛

    ├╾═╼･ﾟ𖤐ﾟ･｡📌｡･ﾟ𖤐ﾟ･╾═╼┓
    ┃╭╾═╼〔 • 📌 • 〕╾═╼╮
    ┃╎ ✧ ${p}ping
    ┃╎ ✧ ${p}clima
    ┃╎ ✧ ${p}traduzir
    ┃╎ ✧ ${p}cep
    ┃╎ ✧ ${p}qrcode
    ┃╎ ✧ ${p}tagall
    ┃╎ ✧ ${p}.
    ┃╰╾═╼〔 • 📌 • 〕╾═╼╯
    ├╾═╼･ﾟ𖤐ﾟ･｡📌｡･ﾟ𖤐ﾟ･╾═╼┛

    ├╾═╼･ﾟ𖤐ﾟ･｡⚙️｡･ﾟ𖤐ﾟ･╾═╼┓
    ┃╭╾═╼〔 • ⚙️ • 〕╾═╼╮
    ┃╎ ✧ ${p}ban
    ┃╎ ✧ ${p}promover
    ┃╎ ✧ ${p}rebaixar
    ┃╎ ✧ ${p}mute
    ┃╎ ✧ ${p}link
    ┃╎ ✧ ${p}hidetag
    ┃╰╾═╼〔 • ⚙️ • 〕╾═╼╯
    ├╾═╼･ﾟ𖤐ﾟ･｡⚙️｡･ﾟ𖤐ﾟ･╾═╼┛

    ├╾═╼･ﾟ𖤐ﾟ･｡👑｡･ﾟ𖤐ﾟ･╾═╼┓
    ┃╭╾═╼〔 • 👑 • 〕╾═╼╮
    ┃╎ ✧ ${p}dono
    ┃╎ ✧ ${p}menu18
    ┃╰╾═╼〔 • 👑 • 〕╾═╼╯
    ├╾═╼･ﾟ𖤐ﾟ･｡👑｡･ﾟ𖤐ﾟ･╾═╼┛

    ├╾═╼･ﾟ𖤐ﾟ･｡🎭｡･ﾟ𖤐ﾟ･╾═╼┓
    ┃╭╾═╼〔 • 🎭 • 〕╾═╼╮
    ┃╎ ✧ 🔥 Use ${p}brincadeiras
    ┃╎ ✧ para jogar, zoar e se divertir!
    ┃╎ ✧ 📖 Use ${p}grimorio
    ┃╎ ✧ lista completa por categoria
    ┃╎ ✧ Jogos, interações, roleplay,
    ┃╎ ✧ rankings e muito mais!
    ┃╰╾═╼〔 • 🎭 • 〕╾═╼╯
    ├╾═╼･ﾟ𖤐ﾟ･｡🎭｡･ﾟ𖤐ﾟ･╾═╼┛

    ✧ 𝕻𝖗𝖊𝖋𝖎𝖝𝖔: ${p}
    ✧ 𝕮𝖔𝖒𝖆𝖓𝖉𝖔𝖘: ${total}
    ✧ 𝕿𝖊𝖒𝖆: ⊱🩸 gótico / sombrio 🦇⊰
    `

    try {
      const local = CANDIDATES.find((f) => fs.existsSync(f))
      if (local) {
        await client.sendMessage(
          from,
          { image: fs.readFileSync(local), caption },
                                 { quoted: info }
        )
      } else {
        await client.sendMessage(
          from,
          {
            image: { url: 'https://i.ibb.co/L9qZ6v0/NYX-BOT-DARK.jpg' },
            caption
          },
          { quoted: info }
        )
      }
    } catch (e) {
      console.error('[menu]', e.message)
      await reply(caption)
    }
  }
}
