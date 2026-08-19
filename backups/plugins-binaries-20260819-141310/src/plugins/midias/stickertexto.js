const { exec } = require('child_process')
const fs = require('fs')
const path = require('path')
const { tmpdir } = require('os')
const Crypto = require('crypto')
const webp = require('node-webpmux')
// [NyxFix] require de exif2.js removido (não existe na V2)

function run(cmd) {
  return new Promise((resolve, reject) => {
    exec(cmd, { maxBuffer: 30 * 1024 * 1024 }, (err, stdout, stderr) => {
      if (err) return reject(new Error((stderr || err.message || '').toString().slice(0, 400)))
      resolve(stdout)
    })
  })
}

function escapeXml(s) {
  return String(s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}

/** Quebra texto em linhas que cabem na figurinha */
function quebrarLinhas(texto, maxChars) {
  const t = String(texto || '')
  if (!t) return [' ']

  // Se tem espaços, quebra por palavra
  if (/\s/.test(t)) {
    const words = t.trim().split(/\s+/).filter(Boolean)
    const lines = []
    let cur = ''
    for (const w of words) {
      // palavra maior que a linha: quebra a palavra
      if (w.length > maxChars) {
        if (cur) { lines.push(cur); cur = '' }
        for (let i = 0; i < w.length; i += maxChars) {
          lines.push(w.slice(i, i + maxChars))
        }
        continue
      }
      if ((cur + ' ' + w).trim().length > maxChars) {
        if (cur) lines.push(cur)
        cur = w
      } else {
        cur = (cur + ' ' + w).trim()
      }
    }
    if (cur) lines.push(cur)
    return lines.slice(0, 10)
  }

  // Sem espaço (ex: suaaaaaaa...): quebra em pedaços fixos
  const lines = []
  for (let i = 0; i < t.length; i += maxChars) {
    lines.push(t.slice(i, i + maxChars))
  }
  return lines.slice(0, 10)
}

const ESTILOS = {
  verde:  { bg: '#8CCC03', fg: '#000000', shadow: false, border: false },
  preto:  { bg: '#000000', fg: '#FFFFFF', shadow: false, border: false },
  branco: { bg: '#FFFFFF', fg: '#000000', shadow: false, border: false },
  rosa:   { bg: '#FF69B4', fg: '#FFFFFF', shadow: true,  border: false },
  azul:   { bg: '#1E90FF', fg: '#FFFFFF', shadow: true,  border: false },
  amarelo:{ bg: '#FFD700', fg: '#000000', shadow: false, border: false },
  roxo:   { bg: '#9B59B6', fg: '#FFFFFF', shadow: true,  border: false },
  neon:   { bg: '#0D0D0D', fg: '#39FF14', shadow: true,  border: true  },
}

function parseArgs(q) {
  const result = {
    texto: '',
    bg: '#8CCC03',
    fg: '#000000',
    velocidade: 0.5,
    modo: 'palavra',
    tamanho: 'normal',
    shadow: false,
    border: false
  }
  if (!q) return result

  const parts = q.trim().split(/\s+/)
  const textoParts = []

  for (const p of parts) {
    const pl = p.toLowerCase()
    if (ESTILOS[pl]) { Object.assign(result, ESTILOS[pl]); continue }
    if (['rapida', 'rápida', 'fast', 'quick'].includes(pl)) { result.velocidade = 0.25; continue }
    if (['lenta', 'slow'].includes(pl)) { result.velocidade = 0.85; continue }
    if (['letra', 'letras', 'letter'].includes(pl)) { result.modo = 'letra'; continue }
    if (['palavra', 'palavras', 'word'].includes(pl)) { result.modo = 'palavra'; continue }
    if (['piscar', 'blink', 'flash'].includes(pl)) { result.modo = 'piscar'; continue }
    if (['grande', 'big', 'large', 'gg'].includes(pl)) { result.tamanho = 'grande'; continue }
    if (['pequeno', 'small', 'mini', 'pp'].includes(pl)) { result.tamanho = 'pequeno'; continue }
    if (['sombra', 'shadow'].includes(pl)) { result.shadow = true; continue }
    if (['borda', 'border'].includes(pl)) { result.border = true; continue }
    if (/^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/.test(p)) {
      const hex = p.length === 4 ? '#' + p[1]+p[1]+p[2]+p[2]+p[3]+p[3] : p
      if (!result._c) { result.bg = hex; result._c = 1 }
      else { result.fg = hex }
      continue
    }
    textoParts.push(p)
  }
  result.texto = textoParts.join(' ').trim()
  delete result._c
  return result
}

function calcLayout(texto, tamanho) {
  const len = texto.length
  let maxChars = 14
  let fontSize = 48

  if (tamanho === 'grande') { maxChars = 12; fontSize = 60 }
  if (tamanho === 'pequeno') { maxChars = 18; fontSize = 34 }

  // Textos longos: mais chars por linha, fonte menor
  if (len > 80) { maxChars = 16; fontSize = 28 }
  if (len > 140) { maxChars = 18; fontSize = 24 }
  if (len > 220) { maxChars = 20; fontSize = 20 }

  const lines = quebrarLinhas(texto, maxChars)
  // Ajusta fonte se muitas linhas
  if (lines.length >= 8) fontSize = Math.min(fontSize, 22)
  else if (lines.length >= 6) fontSize = Math.min(fontSize, 28)
  else if (lines.length >= 4) fontSize = Math.min(fontSize, 36)
  else if (lines.length === 1 && len <= 6) fontSize = Math.max(fontSize, 72)

  return { lines, fontSize, maxChars }
}

function makeSvg(textContent, opts) {
  const { lines, fontSize } = calcLayout(textContent, opts.tamanho)
  const lineH = Math.floor(fontSize * 1.15)
  const totalH = lines.length * lineH
  // centraliza verticalmente, com margem mínima
  let startY = Math.floor((512 - totalH) / 2 + fontSize * 0.35)
  if (startY < fontSize) startY = fontSize + 8

  const tspans = lines.map((l, i) =>
    `<tspan x="256" dy="${i === 0 ? 0 : lineH}">${escapeXml(l)}</tspan>`
  ).join('\n    ')

  const shadowFilter = opts.shadow ? `
  <defs>
    <filter id="s" x="-20%" y="-20%" width="140%" height="140%">
      <feDropShadow dx="2" dy="2" stdDeviation="2" flood-color="#000000" flood-opacity="0.45"/>
    </filter>
  </defs>` : ''

  const borderRect = opts.border
    ? `<rect x="8" y="8" width="496" height="496" fill="none" stroke="${opts.fg}" stroke-width="6" rx="20"/>`
    : ''

  const filterAttr = opts.shadow ? ' filter="url(#s)"' : ''

  // Fundo VERDE sólido em TODO o canvas (sem preto)
  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="512" height="512">
  ${shadowFilter}
  <rect width="512" height="512" fill="${opts.bg}"/>
  ${borderRect}
  <text x="256" y="${startY}" text-anchor="middle"
    font-family="Arial Black, Impact, Arial, Helvetica, sans-serif"
    font-size="${fontSize}" font-weight="900" fill="${opts.fg}"
    dominant-baseline="middle"${filterAttr}>
    ${tspans}
  </text>
</svg>`
}

async function svgToPng(svgPath, pngPath) {
  // force fundo opaco, sem transparência preta
  try {
    await run(
      `ffmpeg -y -f lavfi -i "color=c=${''}" 2>/dev/null; ` +
      `ffmpeg -y -background "${arguments[2] || 'white'}" -i "${svgPath}" -vf "scale=512:512:flags=lanczos,format=rgb24" -frames:v 1 "${pngPath}"`
    )
  } catch {}
  if (fs.existsSync(pngPath)) return
  try {
    await run(`ffmpeg -y -i "${svgPath}" -vf "scale=512:512:flags=lanczos,format=rgb24" -frames:v 1 "${pngPath}"`)
  } catch {}
  if (fs.existsSync(pngPath)) return
  await run(`convert "${svgPath}" -resize 512x512! -background none "${pngPath}"`)
}

/** Gera frames da animação — sempre preenche progressivamente o texto */
function buildFrames(texto, modo) {
  const t = String(texto)
  const frames = []

  if (modo === 'piscar') {
    frames.push(t, t, ' ', t, ' ', t, t)
    return frames
  }

  if (modo === 'letra' || !/\s/.test(t)) {
    // letra a letra (também usado quando é uma "palavra" gigante sem espaço)
    // avança em blocos pra não gerar 200 frames
    const step = t.length > 120 ? 4 : t.length > 60 ? 3 : t.length > 30 ? 2 : 1
    for (let i = step; i <= t.length; i += step) {
      frames.push(t.slice(0, i))
    }
    if (frames[frames.length - 1] !== t) frames.push(t)
  } else {
    // palavra por palavra
    const words = t.trim().split(/\s+/).filter(Boolean)
    for (let i = 0; i < words.length; i++) {
      frames.push(words.slice(0, i + 1).join(' '))
    }
  }

  if (!frames.length) frames.push(t)
  // segura no final
  const last = frames[frames.length - 1]
  frames.push(last, last, last)
  // limite de frames (WhatsApp sticker ~ poucos segundos)
  if (frames.length > 40) {
    const out = []
    const step = Math.ceil(frames.length / 36)
    for (let i = 0; i < frames.length; i += step) out.push(frames[i])
    if (out[out.length - 1] !== last) out.push(last, last)
    return out
  }
  return frames
}

async function addExif(webpPath, packname, author) {
  const img = new webp.Image()
  await img.load(webpPath)
  const json = {
    'sticker-pack-id': 'NYX-BOT',
    'sticker-pack-name': packname,
    'sticker-pack-publisher': author,
    emojis: ['🎨']
  }
  const exifAttr = Buffer.from([0x49, 0x49, 0x2A, 0x00, 0x08, 0x00, 0x00, 0x00, 0x01, 0x00, 0x41, 0x57, 0x07, 0x00, 0x00, 0x00, 0x00, 0x00, 0x16, 0x00, 0x00, 0x00])
  const jsonBuff = Buffer.from(JSON.stringify(json), 'utf-8')
  const exif = Buffer.concat([exifAttr, jsonBuff])
  exif.writeUIntLE(jsonBuff.length, 14, 4)
  img.exif = exif
  const out = webpPath.replace(/\.webp$/, '_exif.webp')
  await img.save(out)
  return out
}

module.exports = {
  name: 'stickertexto',
  description: 'Figurinha animada (texto longo + palavra/letra)',
  category: 'midias',
  aliases: ['st', 'texto', 'attp', 'ttp', 'sticktexto', 'stickertext', 'stxt'],
  async execute({ nyx, from, info, reply, reagir, q }) {
    if (!q || !q.trim()) {
      return reply(
`🎨 *STICKER TEXTO*

.st [opções] texto

Animação: palavra · letra · piscar
Estilos: verde preto branco rosa azul...
Velocidade: rapida · lenta

Ex:
.st oi to com tesão
.st letra suaaaaaaaaaa`
      )
    }

    const opts = parseArgs(q)
    // limite alto mas seguro
    if (!opts.texto) return reply('❗ Faltou o texto.')
    opts.texto = opts.texto.slice(0, 280)

    await reagir('⏳')

    const id = Crypto.randomBytes(6).toString('hex')
    const workDir = path.join(tmpdir(), `stxt_${id}`)
    fs.mkdirSync(workDir, { recursive: true })

    const packname = 'Nyx Stickers'
    const author = 'LCSX'

    try {
      // Se for uma string longa sem espaço, força modo letra
      if (!/\s/.test(opts.texto) && opts.texto.length > 12 && opts.modo === 'palavra') {
        opts.modo = 'letra'
      }

      const frames = buildFrames(opts.texto, opts.modo)

      for (let i = 0; i < frames.length; i++) {
        const svgPath = path.join(workDir, `f${String(i).padStart(3, '0')}.svg`)
        const pngPath = path.join(workDir, `f${String(i).padStart(3, '0')}.png`)
        fs.writeFileSync(svgPath, makeSvg(frames[i], opts))

        // SVG -> PNG com fundo sólido (cor do estilo), sem faixa preta
        const bg = opts.bg || '#8CCC03'
        try {
          await run(
            `ffmpeg -y -f lavfi -i "color=c=${bg.replace('#', '0x')}:s=512x512:d=0.05" -i "${svgPath}" ` +
            `-filter_complex "[0][1]overlay=0:0" -frames:v 1 "${pngPath}"`
          )
        } catch {}
        if (!fs.existsSync(pngPath)) {
          try {
            await run(`ffmpeg -y -i "${svgPath}" -vf "scale=512:512:flags=lanczos,format=rgb24" -frames:v 1 "${pngPath}"`)
          } catch {}
        }
        if (!fs.existsSync(pngPath)) {
          await run(`convert -background "${bg}" -flatten "${svgPath}" -resize 512x512! "${pngPath}"`)
        }
        if (!fs.existsSync(pngPath)) throw new Error('Falha no frame ' + i)
      }

      // 1 frame útil só
      const unique = new Set(frames.map(f => f.trim()))
      if (unique.size <= 1) {
        await sendImageAsSticker2(nyx, from, fs.readFileSync(path.join(workDir, 'f000.png')), info, {
          packname, author, mode: 'stretch'
        })
        await reagir('✅')
        return
      }

      const fps = Math.max(2, Math.min(10, Math.round(1 / opts.velocidade)))
      const webpPath = path.join(workDir, 'out.webp')

      // webp animado, loop, SEM padding preto (já é 512x512 rgb)
      await run(
        `ffmpeg -y -framerate ${fps} -i "${path.join(workDir, 'f%03d.png')}" ` +
        `-vf "scale=512:512:flags=lanczos:force_original_aspect_ratio=disable" ` +
        `-loop 0 -an -c:v libwebp -quality 90 -compression_level 4 "${webpPath}"`
      )

      if (!fs.existsSync(webpPath) || fs.statSync(webpPath).size < 500) {
        throw new Error('Falha ao gerar webp animado (ffmpeg)')
      }

      let finalPath = webpPath
      try { finalPath = await addExif(webpPath, packname, author) } catch {}

      await nyx.sendMessage(from, { sticker: fs.readFileSync(finalPath) }, { quoted: info })
      await reagir('✅')
    } catch (e) {
      console.error('[stickertexto]', e)
      await reagir('❌')
      reply('❌ Erro: ' + (e.message || e) + '\n\n💡 `sudo pacman -S ffmpeg`')
    } finally {
      try {
        for (const f of fs.readdirSync(workDir)) {
          try { fs.unlinkSync(path.join(workDir, f)) } catch {}
        }
        fs.rmdirSync(workDir)
      } catch {}
    }
  }
}
