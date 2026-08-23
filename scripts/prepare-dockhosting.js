'use strict'

// DockHosting: o bot possui plugins legados que chamam "./ffmpeg".
// O pacote ffmpeg-static fornece o binário compatível sem exigir apt/sudo.
const fs = require('fs')
const path = require('path')

try {
  const ffmpeg = require('ffmpeg-static')
  if (!ffmpeg || !fs.existsSync(ffmpeg)) {
    throw new Error('binário ffmpeg-static não encontrado')
  }

  const root = path.join(__dirname, '..')
  const wrapper = path.join(root, 'ffmpeg')
  const script = `#!/bin/sh\nexec "${ffmpeg.replace(/"/g, '\\"')}" "$@"\n`
  fs.writeFileSync(wrapper, script, { mode: 0o755 })
  try { fs.chmodSync(wrapper, 0o755) } catch {}
  console.log('✅ ffmpeg preparado para o DockHosting.')
} catch (err) {
  console.error('❌ Falha ao preparar ffmpeg:', err.message)
  process.exit(1)
}
