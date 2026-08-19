'use strict'

/**
 * Gerador de imagens para jogos — tema gótico/escuro (estilo Nyx).
 * Usa node-canvas (já no package.json). Compatível com os plugins de jogos.
 */

const { createCanvas } = require('canvas')
const path = require('path')
const fs = require('fs')
const { ensureDir, getRandom } = require('../../utils/helpers')

const ROOT = path.join(__dirname, '..', '..', '..')
const TEMP = path.join(ROOT, 'temp')
ensureDir(TEMP)

const C = {
  bg: '#0f0a10',
  panel: '#1a121c',
  cell: '#241a28',
  cellHover: '#2e2233',
  line: '#5c2a3a',
  accent: '#c41e3a',
  text: '#f0e6ea',
  muted: '#8a6a75',
  gold: '#d4af37',
  green: '#2ecc71',
  blue: '#5b8def',
  white: '#ffffff'
}

function save(canvas, prefix = 'game') {
  const out = path.join(TEMP, `${prefix}_${getRandom()}.png`)
  const buf = canvas.toBuffer('image/png')
  fs.writeFileSync(out, buf)
  return out
}

function roundRect(ctx, x, y, w, h, r) {
  const rr = Math.min(r, w / 2, h / 2)
  ctx.beginPath()
  ctx.moveTo(x + rr, y)
  ctx.arcTo(x + w, y, x + w, y + h, rr)
  ctx.arcTo(x + w, y + h, x, y + h, rr)
  ctx.arcTo(x, y + h, x, y, rr)
  ctx.arcTo(x, y, x + w, y, rr)
  ctx.closePath()
}

function fillBg(ctx, w, h) {
  ctx.fillStyle = C.bg
  ctx.fillRect(0, 0, w, h)
  const g = ctx.createRadialGradient(w / 2, h / 2, h * 0.2, w / 2, h / 2, h * 0.75)
  g.addColorStop(0, 'rgba(196,30,58,0.06)')
  g.addColorStop(1, 'rgba(0,0,0,0.35)')
  ctx.fillStyle = g
  ctx.fillRect(0, 0, w, h)
}

async function drawVelha(board = Array(9).fill(null)) {
  const size = 540
  const pad = 28
  const gap = 14
  const canvas = createCanvas(size, size)
  const ctx = canvas.getContext('2d')
  fillBg(ctx, size, size)

  const panel = pad
  const panelSize = size - pad * 2
  roundRect(ctx, panel, panel, panelSize, panelSize, 20)
  ctx.fillStyle = C.panel
  ctx.fill()
  ctx.strokeStyle = C.line
  ctx.lineWidth = 2
  ctx.stroke()

  const inner = panel + 16
  const grid = panelSize - 32
  const cell = (grid - gap * 2) / 3

  for (let i = 0; i < 9; i++) {
    const row = Math.floor(i / 3)
    const col = i % 3
    const x = inner + col * (cell + gap)
    const y = inner + row * (cell + gap)

    roundRect(ctx, x, y, cell, cell, 14)
    ctx.fillStyle = C.cell
    ctx.fill()
    ctx.strokeStyle = 'rgba(196,30,58,0.25)'
    ctx.lineWidth = 1.5
    ctx.stroke()

    const val = board[i]
    const cx = x + cell / 2
    const cy = y + cell / 2

    if (val === 'X' || val === 'x' || val === '❌') {
      ctx.strokeStyle = C.accent
      ctx.lineWidth = 8
      ctx.lineCap = 'round'
      const m = cell * 0.22
      ctx.beginPath()
      ctx.moveTo(cx - m, cy - m)
      ctx.lineTo(cx + m, cy + m)
      ctx.moveTo(cx + m, cy - m)
      ctx.lineTo(cx - m, cy + m)
      ctx.stroke()
    } else if (val === 'O' || val === 'o' || val === '⭕') {
      ctx.strokeStyle = C.blue
      ctx.lineWidth = 8
      ctx.beginPath()
      ctx.arc(cx, cy, cell * 0.28, 0, Math.PI * 2)
      ctx.stroke()
    } else {
      ctx.fillStyle = C.muted
      ctx.font = `600 ${Math.floor(cell * 0.42)}px sans-serif`
      ctx.textAlign = 'center'
      ctx.textBaseline = 'middle'
      ctx.fillText(String(i + 1), cx, cy + 2)
    }
  }

  return save(canvas, 'velha')
}

async function drawForca({ erros = 0, palavraMascarada = '', letrasUsadas = [] }) {
  const w = 520
  const h = 580
  const canvas = createCanvas(w, h)
  const ctx = canvas.getContext('2d')
  fillBg(ctx, w, h)

  roundRect(ctx, 20, 20, w - 40, h - 40, 18)
  ctx.fillStyle = C.panel
  ctx.fill()
  ctx.strokeStyle = C.line
  ctx.lineWidth = 2
  ctx.stroke()

  ctx.strokeStyle = C.text
  ctx.lineWidth = 6
  ctx.lineCap = 'round'
  ctx.beginPath()
  ctx.moveTo(70, 380)
  ctx.lineTo(200, 380)
  ctx.moveTo(110, 380)
  ctx.lineTo(110, 70)
  ctx.lineTo(250, 70)
  ctx.lineTo(250, 110)
  ctx.stroke()

  const ink = C.accent
  ctx.strokeStyle = ink
  ctx.lineWidth = 5

  if (erros >= 1) { ctx.beginPath(); ctx.arc(250, 140, 28, 0, Math.PI * 2); ctx.stroke() }
  if (erros >= 2) { ctx.beginPath(); ctx.moveTo(250, 168); ctx.lineTo(250, 260); ctx.stroke() }
  if (erros >= 3) { ctx.beginPath(); ctx.moveTo(250, 190); ctx.lineTo(210, 230); ctx.stroke() }
  if (erros >= 4) { ctx.beginPath(); ctx.moveTo(250, 190); ctx.lineTo(290, 230); ctx.stroke() }
  if (erros >= 5) { ctx.beginPath(); ctx.moveTo(250, 260); ctx.lineTo(215, 320); ctx.stroke() }
  if (erros >= 6) { ctx.beginPath(); ctx.moveTo(250, 260); ctx.lineTo(285, 320); ctx.stroke() }

  ctx.fillStyle = C.text
  ctx.font = 'bold 36px monospace'
  ctx.textAlign = 'center'
  ctx.fillText((palavraMascarada || '').split('').join('  ') || '_ _ _', w / 2, 440)

  ctx.fillStyle = C.muted
  ctx.font = '18px sans-serif'
  const usadas = (letrasUsadas || []).join(' ').toUpperCase() || '—'
  ctx.fillText(`Usadas: ${usadas}`, w / 2, 490)

  ctx.fillStyle = C.accent
  ctx.font = '16px sans-serif'
  ctx.fillText(`Erros: ${erros}/6`, w / 2, 525)

  return save(canvas, 'forca')
}

async function drawDado(face = 1) {
  face = Math.max(1, Math.min(6, Number(face) || 1))
  const size = 360
  const canvas = createCanvas(size, size)
  const ctx = canvas.getContext('2d')
  fillBg(ctx, size, size)

  const box = 220
  const x = (size - box) / 2
  const y = (size - box) / 2
  roundRect(ctx, x, y, box, box, 28)
  ctx.fillStyle = C.cell
  ctx.fill()
  ctx.strokeStyle = C.accent
  ctx.lineWidth = 3
  ctx.stroke()

  const dots = {
    1: [[0.5, 0.5]],
    2: [[0.28, 0.28], [0.72, 0.72]],
    3: [[0.28, 0.28], [0.5, 0.5], [0.72, 0.72]],
    4: [[0.28, 0.28], [0.72, 0.28], [0.28, 0.72], [0.72, 0.72]],
    5: [[0.28, 0.28], [0.72, 0.28], [0.5, 0.5], [0.28, 0.72], [0.72, 0.72]],
    6: [[0.28, 0.25], [0.72, 0.25], [0.28, 0.5], [0.72, 0.5], [0.28, 0.75], [0.72, 0.75]]
  }

  ctx.fillStyle = C.text
  for (const [px, py] of dots[face]) {
    ctx.beginPath()
    ctx.arc(x + box * px, y + box * py, 16, 0, Math.PI * 2)
    ctx.fill()
  }

  return save(canvas, 'dado')
}

async function drawMoeda(lado = 'cara') {
  const size = 360
  const canvas = createCanvas(size, size)
  const ctx = canvas.getContext('2d')
  fillBg(ctx, size, size)

  const cx = size / 2
  const cy = size / 2
  const r = 110

  ctx.beginPath()
  ctx.arc(cx, cy, r, 0, Math.PI * 2)
  ctx.fillStyle = C.gold
  ctx.fill()
  ctx.strokeStyle = '#a88b2a'
  ctx.lineWidth = 8
  ctx.stroke()

  ctx.beginPath()
  ctx.arc(cx, cy, r - 18, 0, Math.PI * 2)
  ctx.strokeStyle = 'rgba(0,0,0,0.25)'
  ctx.lineWidth = 3
  ctx.stroke()

  ctx.fillStyle = '#3a2e0a'
  ctx.font = 'bold 42px sans-serif'
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'
  const label = String(lado).toLowerCase().startsWith('coroa') ? 'COROA' : 'CARA'
  ctx.fillText(label, cx, cy)

  return save(canvas, 'moeda')
}

function wrapText(ctx, text, maxWidth) {
  const words = text.split(/\\s+/)
  const lines = []
  let cur = ''
  for (const word of words) {
    const test = cur ? cur + ' ' + word : word
    if (ctx.measureText(test).width > maxWidth && cur) {
      lines.push(cur)
      cur = word
    } else {
      cur = test
    }
  }
  if (cur) lines.push(cur)
  return lines
}

async function drawQuiz({ pergunta, opcoes = [] }) {
  const w = 560
  const h = 420
  const canvas = createCanvas(w, h)
  const ctx = canvas.getContext('2d')
  fillBg(ctx, w, h)

  roundRect(ctx, 20, 20, w - 40, h - 40, 18)
  ctx.fillStyle = C.panel
  ctx.fill()
  ctx.strokeStyle = C.line
  ctx.lineWidth = 2
  ctx.stroke()

  ctx.fillStyle = C.accent
  ctx.font = 'bold 18px sans-serif'
  ctx.textAlign = 'left'
  ctx.fillText('QUIZ', 40, 55)

  ctx.fillStyle = C.text
  ctx.font = '22px sans-serif'
  const lines = wrapText(ctx, String(pergunta || ''), w - 80)
  let y = 95
  for (const line of lines.slice(0, 4)) {
    ctx.fillText(line, 40, y)
    y += 28
  }

  y += 16
  const letters = ['A', 'B', 'C', 'D']
  ;(opcoes || []).slice(0, 4).forEach((op, i) => {
    roundRect(ctx, 40, y, w - 80, 44, 10)
    ctx.fillStyle = C.cell
    ctx.fill()
    ctx.strokeStyle = 'rgba(196,30,58,0.3)'
    ctx.stroke()
    ctx.fillStyle = C.gold
    ctx.font = 'bold 18px sans-serif'
    ctx.fillText(letters[i], 55, y + 28)
    ctx.fillStyle = C.text
    ctx.font = '18px sans-serif'
    ctx.fillText(String(op).slice(0, 40), 90, y + 28)
    y += 56
  })

  return save(canvas, 'quiz')
}

async function drawMemoria(cartas = []) {
  const cols = 4
  const rows = 2
  const cell = 110
  const gap = 14
  const pad = 24
  const w = pad * 2 + cols * cell + (cols - 1) * gap
  const h = pad * 2 + rows * cell + (rows - 1) * gap + 10
  const canvas = createCanvas(w, h)
  const ctx = canvas.getContext('2d')
  fillBg(ctx, w, h)

  for (let i = 0; i < 8; i++) {
    const row = Math.floor(i / cols)
    const col = i % cols
    const x = pad + col * (cell + gap)
    const y = pad + row * (cell + gap)
    const c = cartas[i] || { aberta: false, valor: '?', encontrada: false }

    roundRect(ctx, x, y, cell, cell, 14)
    if (c.encontrada) ctx.fillStyle = '#1a2e22'
    else if (c.aberta) ctx.fillStyle = C.cellHover
    else ctx.fillStyle = C.cell
    ctx.fill()
    ctx.strokeStyle = c.encontrada ? C.green : C.line
    ctx.lineWidth = 2
    ctx.stroke()

    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    if (c.aberta || c.encontrada) {
      ctx.font = '42px sans-serif'
      ctx.fillStyle = C.text
      ctx.fillText(String(c.valor || '?'), x + cell / 2, y + cell / 2 + 2)
    } else {
      ctx.fillStyle = C.muted
      ctx.font = 'bold 28px sans-serif'
      ctx.fillText(String(i + 1), x + cell / 2, y + cell / 2 + 2)
    }
  }

  return save(canvas, 'memoria')
}

async function drawAdivinha({ dica, tentativas, maxTentativas }) {
  const w = 480
  const h = 320
  const canvas = createCanvas(w, h)
  const ctx = canvas.getContext('2d')
  fillBg(ctx, w, h)

  roundRect(ctx, 20, 20, w - 40, h - 40, 18)
  ctx.fillStyle = C.panel
  ctx.fill()
  ctx.strokeStyle = C.line
  ctx.lineWidth = 2
  ctx.stroke()

  ctx.fillStyle = C.accent
  ctx.font = 'bold 20px sans-serif'
  ctx.textAlign = 'center'
  ctx.fillText('🔮 ADIVINHA', w / 2, 70)

  ctx.fillStyle = C.text
  ctx.font = '28px sans-serif'
  ctx.fillText(String(dica || 'Tente um número'), w / 2, 140)

  const t = Number(tentativas) || 0
  const max = Number(maxTentativas) || 7
  ctx.fillStyle = C.muted
  ctx.font = '18px sans-serif'
  ctx.fillText(`Tentativas: ${t}/${max}`, w / 2, 200)

  const bx = 60
  const bw = w - 120
  roundRect(ctx, bx, 230, bw, 16, 8)
  ctx.fillStyle = C.cell
  ctx.fill()
  const pct = Math.min(1, t / max)
  if (pct > 0) {
    roundRect(ctx, bx, 230, bw * pct, 16, 8)
    ctx.fillStyle = pct > 0.7 ? C.accent : C.gold
    ctx.fill()
  }

  return save(canvas, 'adivinha')
}


/** Card de medidor (% ) — gay, corno, burro, etc. */
async function drawMeter({ title = 'MEDIDOR', emoji = '📊', name = 'Alguém', percent = 0 }) {
  const w = 500
  const h = 280
  const canvas = createCanvas(w, h)
  const ctx = canvas.getContext('2d')
  fillBg(ctx, w, h)

  roundRect(ctx, 20, 20, w - 40, h - 40, 18)
  ctx.fillStyle = C.panel
  ctx.fill()
  ctx.strokeStyle = C.line
  ctx.lineWidth = 2
  ctx.stroke()

  ctx.fillStyle = C.accent
  ctx.font = 'bold 18px sans-serif'
  ctx.textAlign = 'center'
  ctx.fillText(`${emoji}  ${String(title).toUpperCase()}`, w / 2, 60)

  ctx.fillStyle = C.text
  ctx.font = 'bold 26px sans-serif'
  const display = String(name).length > 22 ? String(name).slice(0, 20) + '…' : String(name)
  ctx.fillText(display, w / 2, 110)

  const pct = Math.max(0, Math.min(100, Number(percent) || 0))
  ctx.fillStyle = C.gold
  ctx.font = 'bold 48px sans-serif'
  ctx.fillText(`${pct}%`, w / 2, 170)

  // barra
  const bx = 60
  const by = 200
  const bw = w - 120
  const bh = 22
  roundRect(ctx, bx, by, bw, bh, 11)
  ctx.fillStyle = C.cell
  ctx.fill()
  if (pct > 0) {
    roundRect(ctx, bx, by, Math.max(bh, (bw * pct) / 100), bh, 11)
    ctx.fillStyle = pct >= 70 ? C.accent : pct >= 40 ? C.gold : C.green
    ctx.fill()
  }

  return save(canvas, 'meter')
}

/** Card de interação (beijo, abraço, tapa...) */
async function drawInteract({ action = 'interagiu com', emoji = '✨', fromName = 'A', toName = 'B' }) {
  const w = 520
  const h = 260
  const canvas = createCanvas(w, h)
  const ctx = canvas.getContext('2d')
  fillBg(ctx, w, h)

  roundRect(ctx, 20, 20, w - 40, h - 40, 18)
  ctx.fillStyle = C.panel
  ctx.fill()
  ctx.strokeStyle = C.line
  ctx.lineWidth = 2
  ctx.stroke()

  ctx.font = '56px sans-serif'
  ctx.textAlign = 'center'
  ctx.fillText(String(emoji), w / 2, 90)

  ctx.fillStyle = C.text
  ctx.font = 'bold 22px sans-serif'
  const a = String(fromName).slice(0, 18)
  const b = String(toName).slice(0, 18)
  ctx.fillText(`${a}`, w / 2, 140)

  ctx.fillStyle = C.accent
  ctx.font = '18px sans-serif'
  ctx.fillText(String(action), w / 2, 175)

  ctx.fillStyle = C.text
  ctx.font = 'bold 22px sans-serif'
  ctx.fillText(`${b}`, w / 2, 210)

  return save(canvas, 'interact')
}

/** Card de ship / casal */
async function drawShip({ p1 = 'A', p2 = 'B', percent = 50 }) {
  const w = 520
  const h = 300
  const canvas = createCanvas(w, h)
  const ctx = canvas.getContext('2d')
  fillBg(ctx, w, h)

  roundRect(ctx, 20, 20, w - 40, h - 40, 18)
  ctx.fillStyle = C.panel
  ctx.fill()
  ctx.strokeStyle = C.line
  ctx.lineWidth = 2
  ctx.stroke()

  ctx.fillStyle = C.accent
  ctx.font = 'bold 20px sans-serif'
  ctx.textAlign = 'center'
  ctx.fillText('💘 SHIP', w / 2, 60)

  ctx.fillStyle = C.text
  ctx.font = 'bold 24px sans-serif'
  ctx.fillText(String(p1).slice(0, 16), w / 2 - 100, 120)
  ctx.fillStyle = C.gold
  ctx.fillText('+', w / 2, 120)
  ctx.fillStyle = C.text
  ctx.fillText(String(p2).slice(0, 16), w / 2 + 100, 120)

  const pct = Math.max(0, Math.min(100, Number(percent) || 0))
  let heart = '💔'
  if (pct >= 85) heart = '💖🔥'
  else if (pct >= 60) heart = '💕'
  else if (pct >= 30) heart = '💛'

  ctx.font = '36px sans-serif'
  ctx.fillText(heart, w / 2, 175)

  ctx.fillStyle = C.gold
  ctx.font = 'bold 40px sans-serif'
  ctx.fillText(`${pct}%`, w / 2, 225)

  const bx = 80
  const bw = w - 160
  roundRect(ctx, bx, 245, bw, 14, 7)
  ctx.fillStyle = C.cell
  ctx.fill()
  if (pct > 0) {
    roundRect(ctx, bx, 245, Math.max(14, (bw * pct) / 100), 14, 7)
    ctx.fillStyle = C.accent
    ctx.fill()
  }

  return save(canvas, 'ship')
}

/** Card de ranking top N */
async function drawRank({ title = 'RANKING', emoji = '🏆', items = [] }) {
  const n = Math.min(10, (items || []).length || 1)
  const w = 520
  const rowH = 42
  const h = 80 + n * rowH + 30
  const canvas = createCanvas(w, h)
  const ctx = canvas.getContext('2d')
  fillBg(ctx, w, h)

  roundRect(ctx, 16, 16, w - 32, h - 32, 16)
  ctx.fillStyle = C.panel
  ctx.fill()
  ctx.strokeStyle = C.line
  ctx.lineWidth = 2
  ctx.stroke()

  ctx.fillStyle = C.accent
  ctx.font = 'bold 20px sans-serif'
  ctx.textAlign = 'center'
  ctx.fillText(`${emoji}  ${String(title).toUpperCase()}`, w / 2, 50)

  let y = 85
  ;(items || []).slice(0, 10).forEach((it, i) => {
    const name = String(it.name || it.id || '?').slice(0, 20)
    const val = it.value != null ? String(it.value) : ''
    // zebra
    if (i % 2 === 0) {
      roundRect(ctx, 30, y - 22, w - 60, rowH - 6, 8)
      ctx.fillStyle = C.cell
      ctx.fill()
    }
    ctx.fillStyle = i === 0 ? C.gold : i === 1 ? '#c0c0c0' : i === 2 ? '#cd7f32' : C.text
    ctx.font = 'bold 18px sans-serif'
    ctx.textAlign = 'left'
    ctx.fillText(`${i + 1}.`, 45, y)
    ctx.fillStyle = C.text
    ctx.font = '18px sans-serif'
    ctx.fillText(name, 80, y)
    ctx.textAlign = 'right'
    ctx.fillStyle = C.gold
    ctx.fillText(val, w - 45, y)
    y += rowH
  })

  return save(canvas, 'rank')
}

/** Card genérico de texto (cantada, piada, 8ball...) */
async function drawQuote({ title = 'NYX', emoji = '✨', text = '' }) {
  const w = 520
  const canvas = createCanvas(w, 240)
  const ctx = canvas.getContext('2d')
  // medir texto
  ctx.font = '20px sans-serif'
  const lines = wrapText(ctx, String(text || ''), w - 80)
  const h = Math.max(200, 100 + lines.length * 28 + 40)
  const canvas2 = createCanvas(w, h)
  const c = canvas2.getContext('2d')
  fillBg(c, w, h)
  roundRect(c, 20, 20, w - 40, h - 40, 18)
  c.fillStyle = C.panel
  c.fill()
  c.strokeStyle = C.line
  c.lineWidth = 2
  c.stroke()

  c.fillStyle = C.accent
  c.font = 'bold 18px sans-serif'
  c.textAlign = 'center'
  c.fillText(`${emoji}  ${String(title).toUpperCase()}`, w / 2, 55)

  c.fillStyle = C.text
  c.font = '20px sans-serif'
  let y = 100
  for (const line of lines.slice(0, 8)) {
    c.fillText(line, w / 2, y)
    y += 28
  }

  return save(canvas2, 'quote')
}

module.exports = {
  drawVelha,
  drawForca,
  drawDado,
  drawMoeda,
  drawQuiz,
  drawMemoria,
  drawAdivinha,
  drawMeter,
  drawInteract,
  drawShip,
  drawRank,
  drawQuote
}
