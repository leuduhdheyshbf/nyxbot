'use strict'

module.exports = {
  name: 'loja',
  description: 'Loja de itens com NyxCoins',
  category: 'utilidades',
  aliases: ['shop'],
  cooldown: 5,
  async execute({ args, sender, reply, economy, config, prefix }) {
    const items = economy.listShop()
    const sym = config.moeda?.simbolo || '🩸'

    if (!args[0]) {
      let txt = `┏╾═╼ ⊱🩸 𝙇𝙊𝙅𝘼 🩸⊰ ═╼┓\n\n`
      for (const it of items) {
        txt += `• *${it.id}* — ${it.nome}\n  ${sym}${it.preco} — ${it.desc}\n\n`
      }
      txt += `Comprar: *${prefix}loja [id]*`
      return reply(txt)
    }

    const r = economy.buy(sender, args[0].toLowerCase())
    if (!r.ok) return reply(`❌ ${r.reason}`)
    await reply(`✅ Comprou *${r.item.nome}* por ${sym}${r.item.preco}`)
  }
}
