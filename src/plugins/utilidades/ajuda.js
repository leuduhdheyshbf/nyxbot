module.exports = {
  name: 'ajuda',
  description: 'Explica um comando',
  category: 'utilidades',
  aliases: ['helpcmd', 'comand'],
  async execute({ reply, reagir, args, prefix, commandManager }) {
    const nome = (args[0]||'').toLowerCase()
    if (!nome) return reply(`❗ Use: ${prefix||'.'}ajuda s\nEx: .ajuda play`)
    await reagir('📖')
    // lista básica embutida
    const desc = {
      s: 'Cria figurinha. Opções: .s | .s quadrada | .s esticar',
      play: 'Baixa música do YouTube em MP3',
      ytmp4: 'Baixa vídeo do YouTube',
      tiktok: 'Baixa vídeo do TikTok',
      instagram: 'Baixa post do Instagram',
      level: 'Mostra seu XP e level',
      rank: 'Ranking de XP do grupo',
      daily: 'Pega XP diário',
      warn: 'Dá advertência (3 = ban)',
      mute: 'Silencia membro',
      mutetempo: 'Silencia por X minutos',
      antilink: 'Liga/desliga anti-link',
      antiflood: 'Liga/desliga anti-spam',
      antifake: 'Bloqueia números estrangeiros',
      forca: 'Jogo da forca (.forca letra)',
      menu: 'Mostra todos os comandos'
    }
    if (desc[nome]) return reply(`📖 *${nome}*\n\n${desc[nome]}`)
    reply(`Não achei ajuda para *${nome}*.\nUse .menu pra ver a lista.`)
  }
}
