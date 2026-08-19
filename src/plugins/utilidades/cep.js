const axios = require('axios')

module.exports = {
  name: 'cep',
  description: 'Consulta CEP',
  category: 'utilidades',
  aliases: ['consulta'],
  async execute({ reply, reagir, q }) {
    const cep = (q || '').replace(/\D/g, '')
    if (cep.length !== 8) return reply('❗ Use: .cep 01310100')
    try {
      await reagir('📍')
      const { data } = await axios.get(`https://viacep.com.br/ws/${cep}/json/`)
      if (data.erro) return reply('❌ CEP não encontrado.')
      reply(`📍 *CEP ${cep}*\n\n🏠 ${data.logradouro}\n🏘️ ${data.bairro}\n🏙️ ${data.localidade} - ${data.uf}\n📮 ${data.cep}`)
      await reagir('✅')
    } catch {
      reply('❌ Erro ao consultar CEP.')
    }
  }
}
