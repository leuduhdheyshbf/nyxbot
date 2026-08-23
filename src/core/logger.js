'use strict'

const chalk = require('chalk')

const stamp = () => {
  const d = new Date()
  return d.toLocaleTimeString('pt-BR', { hour12: false })
}

const CyanLog = (msg) => console.log(chalk.cyan(`[${stamp()}] ${msg}`))
const GreenLog = (msg) => console.log(chalk.green(`[${stamp()}] ${msg}`))
const RedLog = (msg) => console.log(chalk.red(`[${stamp()}] ${msg}`))
const YellowLog = (msg) => console.log(chalk.yellow(`[${stamp()}] ${msg}`))
const MagentaLog = (msg) => console.log(chalk.magenta(`[${stamp()}] ${msg}`))

function logCommand({ nome, grupo, comando, isGroup }) {
  const where = isGroup ? chalk.green(grupo || 'grupo') : chalk.blue('PV')
  console.log(
    chalk.gray(`[${stamp()}]`) +
      ` ${chalk.blue(nome || '?')} → ${where} | ${chalk.yellow(comando)}`
  )
}

module.exports = { CyanLog, GreenLog, RedLog, YellowLog, MagentaLog, logCommand }
