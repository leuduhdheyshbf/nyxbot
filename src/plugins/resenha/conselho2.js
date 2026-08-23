module.exports = {
  name: 'conselho2',
  description: 'Conselho aleatório',
  category: 'resenha',
  aliases: [],
  async execute({ reply, reagir }) {
    await reagir('🧭')
    const items = ["Durma cedo pelo menos hoje.","Beba água antes de reclamar da vida.","Não responda mensagem com raiva.","Backup salva amizades e projetos.","Se não custa educar, eduque."]
    const pick = items[Math.floor(Math.random() * items.length)]
    await reply(`🧭 *Conselho aleatório*\n\n${pick}`)
  }
}
