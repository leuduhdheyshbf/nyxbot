module.exports = {
  name: 'sortehoje',
  description: 'Sorte de hoje',
  category: 'resenha',
  aliases: [],
  async execute({ reply, reagir }) {
    await reagir('🔮')
    const items = ["Sorte alta: algo inesperado positivo.","Sorte média: dia normal com plot twist.","Sorte baixa: paciência será testada.","Sorte caótica: prepare o coração.","Sorte lendária: aproveite sem overthink."]
    const pick = items[Math.floor(Math.random() * items.length)]
    await reply(`🔮 *Sorte de hoje*\n\n${pick}`)
  }
}
