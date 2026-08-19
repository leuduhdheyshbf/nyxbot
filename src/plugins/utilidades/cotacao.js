const axios = require('axios')

module.exports = {
  name: 'cotacao',
  description: 'Cotação do dólar/euro',
  category: 'utilidades',
  aliases: ['dolar', 'euro', 'moeda'],
  async execute({ reply, reagir }) {
    try {
      await reagir('💱')
      const { data } = await axios.get('https://economia.awesomeapi.com.br/last/USD-BRL,EUR-BRL,BTC-BRL')
      const usd = data.USDBRL
      const eur = data.EURBRL
      const btc = data.BTCBRL
      reply(`💱 *Cotações*\n\n💵 Dólar: R$ ${parseFloat(usd.bid).toFixed(2)}\n💶 Euro: R$ ${parseFloat(eur.bid).toFixed(2)}\n₿ Bitcoin: R$ ${parseFloat(btc.bid).toFixed(2)}\n\n🕒 ${usd.create_date}`)
    } catch {
      reply('❌ Erro ao buscar cotação.')
    }
  }
}
