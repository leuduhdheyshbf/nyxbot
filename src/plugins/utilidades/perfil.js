module.exports = {
  name: 'perfil',
  description: 'Mostra foto e info de um usuário',
  category: 'utilidades',
  aliases: ['profile', 'p'],
  async execute({ nyx, from, info, reply, reagir, args, sender, groupMembers }) {
    try {
      await reagir('👤')

      let target = sender
      const quoted = info.message?.extendedTextMessage?.contextInfo
      if (quoted?.participant) target = quoted.participant
      else if (quoted?.mentionedJid?.[0]) target = quoted.mentionedJid[0]
      else if (args[0]) target = args[0].replace(/[^0-9]/g, '') + '@s.whatsapp.net'

      let ppUrl
      try {
        ppUrl = await nyx.profilePictureUrl(target, 'image')
      } catch {
        ppUrl = null
      }

      let status = ''
      try {
        const st = await nyx.fetchStatus(target)
        status = st?.status || ''
      } catch {}

      const numero = target.split('@')[0]
      const caption = `👤 *Perfil*\n\n📱 Número: ${numero}\n📝 Status: ${status || 'Sem status'}`

      if (ppUrl) {
        await nyx.sendMessage(from, {
          image: { url: ppUrl },
          caption
        }, { quoted: info })
      } else {
        reply(caption + '\n\n📷 Sem foto de perfil')
      }
      await reagir('✅')
    } catch (e) {
      console.error(e)
      reply('❌ Erro ao buscar perfil.')
    }
  }
}
