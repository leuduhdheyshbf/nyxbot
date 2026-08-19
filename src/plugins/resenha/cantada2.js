module.exports = {
  name: 'cantada2',
  description: 'Cantada 2.0',
  category: 'resenha',
  aliases: [],
  async execute({ reply, reagir }) {
    await reagir('😏')
    const items = ["Você é Wi-Fi? Porque sinto falta quando não está perto.","Seu nome é capítulo? Porque quero continuar.","Não sou café, mas posso te manter acordado.","Você é notificação? Porque meu coração vibra.","Me empresta um mapa? Me perdi no seu olhar."]
    const pick = items[Math.floor(Math.random() * items.length)]
    await reply(`😏 *Cantada 2.0*\n\n${pick}`)
  }
}
