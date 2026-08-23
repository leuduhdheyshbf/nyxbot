'use strict'

const { getMarriageInfo, formatDate, isMarried } = require('../../utils/marriage')
const { resolveTarget } = require('../../utils/gifUtils')

module.exports = {
  name: 'casamento',
  description: 'Mostra o status de casamento 💍',
  category: 'resenha',
  aliases: ['statuscasamento', 'esposa', 'marido', 'conjuge'],
  cooldown: 3,

  async execute({ client, from, info, args, reply, reagir, sender }) {
    await reagir('💍')

    const target = resolveTarget(info, args) || sender
    const infoM = getMarriageInfo(target)

    const tag = '@' + String(target).split('@')[0]

    if (!infoM) {
      await client.sendMessage(
        from,
        {
          text: `💍 ${tag} *não está casado(a)*.\n\nUse *.casar @pessoa* para pedir em casamento!`,
          mentions: [target]
        },
        { quoted: info }
      )
      return
    }

    const spouseTag = '@' + String(infoM.spouse).split('@')[0]
    const data = formatDate(infoM.marriedAt)

    await client.sendMessage(
      from,
      {
        text:
          `💍 *STATUS DO CASAMENTO*\n\n` +
          `👫 ${tag} ❤️ ${spouseTag}\n` +
          `📅 Casados desde: *${data}*\n\n` +
          `_Use .divorciar para se separar._`,
        mentions: [target, infoM.spouse]
      },
      { quoted: info }
    )
  }
}
