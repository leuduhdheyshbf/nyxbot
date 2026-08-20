module.exports = {
  name: 'menu',
  description: 'Menu principal do bot',
  category: 'cmds-aleatorios',
  aliases: ['commands', 'ajuda', 'help', 'comandos'],

  async execute({ client, from, info, prefix, reply }) {
    const IMAGE_URL = 'https://files.catbox.moe/mjxxwp.jpeg'
    const p = prefix || '.'

    const mensagem = `
╔══════════════════════╗
║     ⚔ 𝗡𝗬𝗫 𝗕𝗢𝗧 ⚔
║   ▸ DARK EDITION
╚══════════════════════╝

▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬
  📌 𝗨́𝗧𝗘𝗜𝗦
▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬
➤ ${p}sticker
➤ ${p}toimg
➤ ${p}ping
➤ ${p}dono

▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬
  📥 𝗗𝗢𝗪𝗡𝗟𝗢𝗔𝗗𝗦
▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬
➤ ${p}play
➤ ${p}ytmp4
➤ ${p}tiktok
➤ ${p}instagram

▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬
  ⚙️ 𝗔𝗗𝗠𝗜𝗡
▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬
➤ ${p}ban
➤ ${p}mute
➤ ${p}promover
➤ ${p}rebaixar
➤ ${p}link
➤ ${p}fechar
➤ ${p}abrir

════════════════════════
⚠️ Use ${p}brincadeiras
   para o caos e diversão
════════════════════════
`.trim()

    try {
      await client.sendMessage(
        from,
        {
          image: { url: IMAGE_URL },
          caption: mensagem
        },
        { quoted: info }
      )
    } catch (e) {
      // Fallback só texto se a imagem falhar
      console.error('[menu] falha ao enviar imagem:', e.message)
      await reply(mensagem)
    }
  }
}
