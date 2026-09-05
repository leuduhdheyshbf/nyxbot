'use strict'

/**
 * Stickers rápidos — sharp pra imagem, ffmpeg só pra vídeo
 */

const fs = require('fs')
const path = require('path')
const os = require('os')
const crypto = require('crypto')
const sharp = require('sharp')
const webp = require('node-webpmux')
const { execFile } = require('child_process')
const { promisify } = require('util')
const execFileAsync = promisify(execFile)

const SIZE = 512

function tmp(ext) {
  return path.join(os.tmpdir(), `nyx-stk-${Date.now()}-${crypto.randomBytes(4).toString('hex')}.${ext}`)
}

async function addExif(webpBuffer, { packname = 'Nyx Stickers', author = 'Nyx Bot' } = {}) {
  const img = new webp.Image()
  const inFile = tmp('webp')
  const outFile = tmp('webp')
  try {
    fs.writeFileSync(inFile, webpBuffer)
    await img.load(inFile)
    const json = {
      'sticker-pack-id': 'nyx-bot-v2',
      'sticker-pack-name': packname,
      'sticker-pack-publisher': author,
      emojis: ['🩸']
    }
    const exifAttr = Buffer.from([
      0x49, 0x49, 0x2a, 0x00, 0x08, 0x00, 0x00, 0x00, 0x01, 0x00, 0x41, 0x57,
      0x07, 0x00, 0x00, 0x00, 0x00, 0x00, 0x16, 0x00, 0x00, 0x00
    ])
    const jsonBuff = Buffer.from(JSON.stringify(json), 'utf-8')
    const exif = Buffer.concat([exifAttr, jsonBuff])
    exif.writeUIntLE(jsonBuff.length, 14, 4)
    img.exif = exif
    await img.save(outFile)
    return fs.readFileSync(outFile)
  } finally {
    try { fs.unlinkSync(inFile) } catch {}
    try { fs.unlinkSync(outFile) } catch {}
  }
}

/**
 * Processa imagem com sharp (rápido).
 * modes: normal | square | stretch | circle | blur | gray | invert | pixel | border
 */
async function imageToStickerBuffer(inputBuffer, mode = 'normal') {
  let img = sharp(inputBuffer, { animated: false }).rotate() // auto-orient

  const m = String(mode || 'normal').toLowerCase()

  if (m === 'stretch' || m === 'esticar' || m === 'full') {
    img = img.resize(SIZE, SIZE, { fit: 'fill' })
  } else if (m === 'square' || m === 'quadrada' || m === 'crop') {
    img = img.resize(SIZE, SIZE, { fit: 'cover', position: 'centre' })
  } else if (m === 'circle' || m === 'circulo' || m === 'redonda') {
    img = img.resize(SIZE, SIZE, { fit: 'cover', position: 'centre' })
    const mask = Buffer.from(
      `<svg width="${SIZE}" height="${SIZE}"><circle cx="256" cy="256" r="256" fill="white"/></svg>`
    )
    img = img.composite([{ input: mask, blend: 'dest-in' }])
  } else if (m === 'blur' || m === 'desfoque') {
    img = img.resize(SIZE, SIZE, { fit: 'inside' }).extend({
      top: 0, bottom: 0, left: 0, right: 0, background: { r: 0, g: 0, b: 0, alpha: 0 }
    }).blur(4)
    // ensure canvas 512
    const meta = await img.toBuffer({ resolveWithObject: true })
    img = sharp(meta.data).resize(SIZE, SIZE, {
      fit: 'contain',
      background: { r: 0, g: 0, b: 0, alpha: 0 }
    })
  } else if (m === 'gray' || m === 'pb' || m === 'pretobranco') {
    img = img.resize(SIZE, SIZE, {
      fit: 'contain',
      background: { r: 0, g: 0, b: 0, alpha: 0 }
    }).greyscale()
  } else if (m === 'invert' || m === 'inverter' || m === 'negativo') {
    img = img.resize(SIZE, SIZE, {
      fit: 'contain',
      background: { r: 0, g: 0, b: 0, alpha: 0 }
    }).negate({ alpha: false })
  } else if (m === 'pixel' || m === 'pixelado') {
    img = img.resize(48, 48, { kernel: 'nearest' }).resize(SIZE, SIZE, {
      kernel: 'nearest',
      fit: 'fill'
    })
  } else if (m === 'border' || m === 'borda') {
    img = img.resize(SIZE - 24, SIZE - 24, {
      fit: 'cover',
      position: 'centre'
    }).extend({
      top: 12, bottom: 12, left: 12, right: 12,
      background: { r: 196, g: 30, b: 58, alpha: 1 }
    })
  } else {
    // normal — mantém proporção, pad transparente
    img = img.resize(SIZE, SIZE, {
      fit: 'contain',
      background: { r: 0, g: 0, b: 0, alpha: 0 }
    })
  }

  // webp estático, qualidade boa e rápido
  return img.webp({ quality: 85, effort: 2 }).toBuffer()
}

/** Vídeo/GIF → webp animado (ffmpeg — mais lento, inevitável) */
async function videoToStickerBuffer(inputBuffer, mode = 'normal') {
  const inFile = tmp('mp4')
  const outFile = tmp('webp')
  fs.writeFileSync(inFile, inputBuffer)

  let vf
  const m = String(mode || 'normal').toLowerCase()
  if (m === 'stretch' || m === 'esticar') {
    vf = 'scale=512:512:force_original_aspect_ratio=disable,fps=12'
  } else if (m === 'square' || m === 'quadrada') {
    vf = 'scale=512:512:force_original_aspect_ratio=increase,crop=512:512,fps=12'
  } else {
    vf = 'scale=512:512:force_original_aspect_ratio=decrease,pad=512:512:(ow-iw)/2:(oh-ih)/2:color=0x00000000,fps=12'
  }
  vf += ',split[a][b];[a]palettegen=reserve_transparent=on:transparency_color=ffffff[p];[b][p]paletteuse'

  try {
    // timeout aumentado + compression_level 0 pra encoding mais rápido
    await execFileAsync(
      'ffmpeg',
      ['-y', '-i', inFile, '-vcodec', 'libwebp', '-vf', vf, '-loop', '0', '-an', '-t', '8', '-compression_level', '0', outFile],
      { timeout: 60000 }
    )
    const stats = fs.statSync(outFile)
    if (stats.size < 500) throw new Error('Webp muito pequeno (' + stats.size + ' bytes)')
    return fs.readFileSync(outFile)
  } catch (e) {
    // fallback: tenta converter em PNG sequência → animação
    const pngOut = tmp('png')
    try {
      await execFileAsync(
        'ffmpeg',
        ['-y', '-i', inFile, '-vf', 'scale=512:512:force_original_aspect_ratio=decrease,pad=512:512:(ow-iw)/2:(oh-ih)/2:color=0x00000000,fps=12', '-frames:v', '1', pngOut],
        { timeout: 30000 }
      )
      return fs.readFileSync(pngOut)
    } finally {
      try { fs.unlinkSync(inFile) } catch {}
      try { fs.unlinkSync(outFile) } catch {}
      try { fs.unlinkSync(pngOut) } catch {}
    }
  }
}

async function sendSticker(sock, from, buffer, quoted, meta = {}) {
  const withExif = await addExif(buffer, meta)
  await sock.sendMessage(from, { sticker: withExif }, { quoted })
}

module.exports = {
  imageToStickerBuffer,
  videoToStickerBuffer,
  sendSticker,
  addExif
}
