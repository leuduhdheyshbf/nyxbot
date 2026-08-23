module.exports = {
  name: 'morse',
  description: 'Texto → código Morse',
  category: 'utilidades',
  aliases: [],
  async execute({ reply, q }) {
    if (!q) return reply('❗ Envie um texto.')
    const map = {A:'.-',B:'-...',C:'-.-.',D:'-..',E:'.',F:'..-.',G:'--.',H:'....',I:'..',J:'.---',K:'-.-',L:'.-..',M:'--',N:'-.',O:'---',P:'.--.',Q:'--.-',R:'.-.',S:'...',T:'-',U:'..-',V:'...-',W:'.--',X:'-..-',Y:'-.--',Z:'--..','0':'-----','1':'.----','2':'..---','3':'...--','4':'....-','5':'.....','6':'-....','7':'--...','8':'---..','9':'----.',' ':'/'}
    const out = [...q.toUpperCase()].map(c => map[c] || c).join(' ')
    await reply('📡 ' + out)
  }
}
