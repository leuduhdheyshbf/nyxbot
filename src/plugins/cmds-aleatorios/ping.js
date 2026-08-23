module.exports = {
    name: 'ping',
    description: 'Mostra a velocidade de resposta do bot',
    category: 'cmds-aleatorios',
    aliases: ['p', 'latency', 'vel'],
    async execute({ reply, reagir }) {
        const start = Date.now()
        await reagir('🏓')
        const latency = Date.now() - start

        reply(`🏓 *Pong!*\n\n⚡ Latência: *${latency}ms*\n🤖 Bot online e funcionando!`)
    }
}
