'use strict'

/**
 * Gerador de imagens para jogos — tema gótico/escuro (estilo Nyx).
 * Usa node-canvas (já no package.json). Compatível com os plugins de jogos.
 */

const { createCanvas } = require('canvas')
const path = require('path')
const fs = require('fs')
const { ensureDir, getRandom } = require('../../utils/helpers')
const { fetchCardImage, generateBg } = require('../../utils/cardApi')

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
  const raw = String(text || '').trim() || ' '
  const words = raw.split(/\s+/).filter(Boolean)
  const lines = []
  let cur = ''

  const pushWord = (word) => {
    // quebra palavra longa que não cabe
    if (ctx.measureText(word).width <= maxWidth) {
      if (cur) {
        const test = cur + ' ' + word
        if (ctx.measureText(test).width <= maxWidth) {
          cur = test
        } else {
          lines.push(cur)
          cur = word
        }
      } else {
        cur = word
      }
      return
    }
    if (cur) { lines.push(cur); cur = '' }
    let chunk = ''
    for (const ch of word) {
      const t = chunk + ch
      if (ctx.measureText(t).width > maxWidth && chunk) {
        lines.push(chunk)
        chunk = ch
      } else {
        chunk = t
      }
    }
    if (chunk) cur = chunk
  }

  for (const w of words) pushWord(w)
  if (cur) lines.push(cur)
  return lines.length ? lines : [' ']
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
  const list = (items || []).slice(0, 10)
  const n = Math.max(1, list.length)

  let bgPath = null
  try {
    bgPath = await generateBg({ mood: 'rank' })
  } catch (e) {
    console.error('[drawRank] bg:', e.message)
  }

  const w = 720
  const rowH = 58
  const headerH = 110
  const h = Math.max(720, headerH + n * rowH + 80)
  const canvas = createCanvas(w, h)
  const ctx = canvas.getContext('2d')

  if (bgPath) {
    try {
      const { loadImage } = require('canvas')
      const img = await loadImage(bgPath)
      const scale = Math.max(w / img.width, h / img.height)
      const iw = img.width * scale
      const ih = img.height * scale
      ctx.drawImage(img, (w - iw) / 2, (h - ih) / 2, iw, ih)
      try { fs.unlinkSync(bgPath) } catch {}
    } catch {
      fillBg(ctx, w, h)
    }
  } else {
    fillBg(ctx, w, h)
  }

  // overlay escuro
  ctx.fillStyle = 'rgba(8, 5, 10, 0.72)'
  ctx.fillRect(0, 0, w, h)

  // card
  roundRect(ctx, 24, 24, w - 48, h - 48, 22)
  ctx.fillStyle = 'rgba(26, 18, 28, 0.88)'
  ctx.fill()
  ctx.strokeStyle = 'rgba(196,30,58,0.7)'
  ctx.lineWidth = 2.5
  ctx.stroke()

  // header
  roundRect(ctx, 24, 24, w - 48, 88, 22)
  ctx.fillStyle = 'rgba(196,30,58,0.3)'
  ctx.fill()
  ctx.fillRect(24, 70, w - 48, 42)

  ctx.fillStyle = C.accent
  ctx.font = 'bold 28px sans-serif'
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'
  ctx.fillText(`${emoji}  ${String(title).toUpperCase()}`, w / 2, 58)
  ctx.fillStyle = C.muted
  ctx.font = '14px sans-serif'
  ctx.fillText('ranking do grupo', w / 2, 92)

  const medals = ['🥇', '🥈', '🥉']
  let y = headerH + 16

  list.forEach((it, i) => {
    let name = String(it.name || ('Top ' + (i + 1))).trim()
    // só vira Top N se for só dígitos longos
    if (/^\+?\d{6,}$/.test(name)) name = 'Top ' + (i + 1)
    if (name.length > 18) name = name.slice(0, 17) + '…'

    const percent = it.percent != null ? Number(it.percent) : null
    const value = it.value != null ? String(it.value) : (percent != null ? percent + '%' : '')

    // row bg
    roundRect(ctx, 40, y, w - 80, rowH - 8, 12)
    ctx.fillStyle = i < 3 ? 'rgba(196,30,58,0.18)' : 'rgba(255,255,255,0.04)'
    ctx.fill()

    const medal = medals[i] || `${i + 1}.`
    ctx.font = '24px sans-serif'
    ctx.textAlign = 'left'
    ctx.textBaseline = 'middle'
    ctx.fillStyle = C.text
    ctx.fillText(medal, 56, y + (rowH - 8) / 2)

    ctx.font = 'bold 20px sans-serif'
    ctx.fillText(name, 110, y + (rowH - 8) / 2)

    if (value) {
      ctx.textAlign = 'right'
      ctx.fillStyle = i === 0 ? C.gold : C.accent
      ctx.font = 'bold 20px sans-serif'
      ctx.fillText(value, w - 56, y + (rowH - 8) / 2)
    }

    y += rowH
  })

  return save(canvas, 'rank')
}


async function drawQuote({ title = 'NYX', emoji = '✨', text = '', exact = false } = {}) {
  // Imagem bonita (IA) + texto legível por cima
  let bgPath = null
  if (!exact) {
    try {
      bgPath = await generateBg({ mood: 'quote' })
    } catch (e) {
      console.error('[drawQuote] bg:', e.message)
    }
  }

  const w = 720
  const padX = 44
  const maxTextW = w - padX * 2 - 20

  const measure = createCanvas(10, 10).getContext('2d')
  measure.font = 'bold 26px sans-serif'
  const lines = wrapText(measure, String(text || ''), maxTextW)
  const lineH = 36
  const headerH = 100
  const boxPad = 28
  const textBlockH = lines.length * lineH + boxPad * 2
  const h = 720

  const canvas = createCanvas(w, h)
  const c = canvas.getContext('2d')

  // fundo
  if (bgPath) {
    try {
      const { loadImage } = require('canvas')
      const img = await loadImage(bgPath)
      // cover
      const scale = Math.max(w / img.width, h / img.height)
      const iw = img.width * scale
      const ih = img.height * scale
      c.drawImage(img, (w - iw) / 2, (h - ih) / 2, iw, ih)
      try { fs.unlinkSync(bgPath) } catch {}
    } catch (e) {
      fillBg(c, w, h)
    }
  } else {
    fillBg(c, w, h)
  }

  // vinheta escura
  const g = c.createLinearGradient(0, 0, 0, h)
  g.addColorStop(0, 'rgba(0,0,0,0.35)')
  g.addColorStop(0.45, 'rgba(0,0,0,0.15)')
  g.addColorStop(0.7, 'rgba(0,0,0,0.55)')
  g.addColorStop(1, 'rgba(0,0,0,0.85)')
  c.fillStyle = g
  c.fillRect(0, 0, w, h)

  // painel de texto na parte de baixo
  const boxY = h - textBlockH - 70
  roundRect(c, 28, boxY, w - 56, textBlockH + 50, 18)
  c.fillStyle = 'rgba(15, 10, 16, 0.82)'
  c.fill()
  c.strokeStyle = 'rgba(196,30,58,0.65)'
  c.lineWidth = 2
  c.stroke()

  // título
  c.fillStyle = C.accent
  c.font = 'bold 22px sans-serif'
  c.textAlign = 'center'
  c.textBaseline = 'middle'
  c.fillText(`${emoji}  ${String(title).toUpperCase()}`, w / 2, boxY + 28)

  // linha
  c.strokeStyle = 'rgba(196,30,58,0.4)'
  c.lineWidth = 1
  c.beginPath()
  c.moveTo(60, boxY + 46)
  c.lineTo(w - 60, boxY + 46)
  c.stroke()

  // frase
  c.fillStyle = C.text
  c.font = 'bold 26px sans-serif'
  c.textAlign = 'center'
  c.textBaseline = 'top'
  let y = boxY + 58
  for (const line of lines) {
    c.fillText(line, w / 2, y)
    y += lineH
  }

  return save(canvas, 'quote')
}

async function drawBrincadeirasMenu({ prefix = '.', sections = [] } = {}) {
  const p = prefix || '.'
  const cols = 2
  const cardW = 340
  const gap = 16
  const pad = 24
  const headerH = 90
  const footerH = 50
  const lineH = 18
  const titleH = 36

  // calcular altura de cada card
  const cards = (sections || []).map((s) => {
    const cmds = s.cmds || []
    // 3 comandos por linha
    const rows = Math.ceil(cmds.length / 3) || 1
    const h = titleH + rows * lineH + 28
    return { ...s, cmds, rows, h }
  })

  // layout em 2 colunas (altura balanceada)
  const colHeights = [0, 0]
  const placed = cards.map((c) => {
    const col = colHeights[0] <= colHeights[1] ? 0 : 1
    const y = colHeights[col]
    colHeights[col] += c.h + gap
    return { ...c, col, y }
  })

  const contentH = Math.max(...colHeights, 100)
  const w = pad * 2 + cols * cardW + gap
  const h = headerH + contentH + footerH + pad

  const canvas = createCanvas(w, h)
  const ctx = canvas.getContext('2d')
  fillBg(ctx, w, h)

  // painel externo
  roundRect(ctx, 12, 12, w - 24, h - 24, 20)
  ctx.fillStyle = C.panel
  ctx.fill()
  ctx.strokeStyle = C.line
  ctx.lineWidth = 2
  ctx.stroke()

  // header
  ctx.fillStyle = C.accent
  ctx.font = 'bold 26px sans-serif'
  ctx.textAlign = 'center'
  ctx.fillText('☠  BRINCADEIRAS  ☠', w / 2, 48)
  ctx.fillStyle = C.muted
  ctx.font = '14px sans-serif'
  ctx.fillText('Todas com imagem  •  tema gótico Nyx', w / 2, 72)

  // linha decorativa
  ctx.strokeStyle = C.line
  ctx.beginPath()
  ctx.moveTo(40, 82)
  ctx.lineTo(w - 40, 82)
  ctx.stroke()

  const startY = headerH

  for (const card of placed) {
    const x = pad + card.col * (cardW + gap)
    const y = startY + card.y

    // card background
    roundRect(ctx, x, y, cardW, card.h, 12)
    ctx.fillStyle = C.cell
    ctx.fill()
    ctx.strokeStyle = C.line
    ctx.lineWidth = 1.5
    ctx.stroke()

    // accent bar on left
    ctx.fillStyle = C.accent
    ctx.fillRect(x, y + 8, 4, card.h - 16)

    // title
    ctx.fillStyle = C.gold
    ctx.font = 'bold 15px sans-serif'
    ctx.textAlign = 'left'
    ctx.fillText(`${card.emoji || '✦'}  ${String(card.title || '').toUpperCase()}`, x + 16, y + 24)

    // commands in 3 columns inside card
    ctx.fillStyle = C.text
    ctx.font = '13px sans-serif'
    const cmds = card.cmds || []
    let cy = y + 44
    for (let i = 0; i < cmds.length; i += 3) {
      const chunk = cmds.slice(i, i + 3)
      const line = chunk.map((c) => p + c).join('   ')
      ctx.fillText(line, x + 16, cy)
      cy += lineH
    }
  }

  // footer
  ctx.fillStyle = C.muted
  ctx.font = '13px sans-serif'
  ctx.textAlign = 'center'
  ctx.fillText(`Voltar: ${p}menu   •   ⊱🩸 gótico / sombrio 🦇⊰`, w / 2, h - 28)

  return save(canvas, 'brincadeiras')
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
  drawQuote,
  drawBrincadeirasMenu
}
