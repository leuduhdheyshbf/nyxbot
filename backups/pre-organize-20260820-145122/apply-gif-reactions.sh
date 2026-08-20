#!/bin/bash
# Aplica: GIFs animados nas reações + remove .dono e refs .menu18
set -euo pipefail

ROOT="$(cd "$(dirname "$0")" && pwd)"
# Se rodado de dentro do projeto ou de Downloads
if [[ -d "$ROOT/src/plugins" ]]; then
  PROJECT="$ROOT"
elif [[ -d "$HOME/Downloads/nyx-bot-v2/src/plugins" ]]; then
  PROJECT="$HOME/Downloads/nyx-bot-v2"
else
  echo "❌ Não encontrei o projeto. Rode de dentro de nyx-bot-v2 ou coloque este script na raiz."
  exit 1
fi

echo "Projeto: $PROJECT"
BACKUP="$PROJECT/backups/gif-reactions-$(date +%Y%m%d-%H%M%S)"
mkdir -p "$BACKUP"

# 1) Backup + atualizar reactions.js
if [[ -f "$PROJECT/src/utils/reactions.js" ]]; then
  mkdir -p "$BACKUP/src/utils"
  cp -a "$PROJECT/src/utils/reactions.js" "$BACKUP/src/utils/"
fi

# Copia o reactions.js fixado se estiver junto deste script
SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
if [[ -f "$SCRIPT_DIR/nyx-fix/src/utils/reactions.js" ]]; then
  cp -a "$SCRIPT_DIR/nyx-fix/src/utils/reactions.js" "$PROJECT/src/utils/reactions.js"
  echo "✅ src/utils/reactions.js atualizado (GIF animado)"
elif [[ -f "$SCRIPT_DIR/reactions.js" ]]; then
  cp -a "$SCRIPT_DIR/reactions.js" "$PROJECT/src/utils/reactions.js"
  echo "✅ src/utils/reactions.js atualizado"
else
  # Inline fix se o arquivo fixado não vier junto
  echo "⚠️  Aplicando patch inline em reactions.js..."
  if grep -q 'gifPlayback' "$PROJECT/src/utils/reactions.js" 2>/dev/null; then
    echo "  (já tem gifPlayback — ok)"
  else
    # Substitui a função sendReactionImages por versão com GIF
    python3 - "$PROJECT/src/utils/reactions.js" << 'PY'
import sys
path = sys.argv[1]
with open(path) as f:
    content = f.read()

old = '''/** Envia 1–3 imagens no chat com caption na primeira */
async function sendReactionImages(client, from, info, urls, caption, mentions = []) {
  if (!urls.length) throw new Error('Nenhuma imagem encontrada')

  for (let i = 0; i < urls.length; i++) {
    const payload = {
      image: { url: urls[i] },
      ...(i === 0
        ? { caption, ...(mentions.length ? { mentions } : {}) }
        : {})
    }
    await client.sendMessage(from, payload, i === 0 ? { quoted: info } : undefined)
  }
}'''

new = '''/** Detecta se a URL parece ser GIF animado */
function isLikelyGif(url) {
  if (!url) return false
  const u = url.toLowerCase()
  return u.includes('.gif') || u.includes('gif') || u.includes('waifu.pics')
}

/** Envia 1–3 reações como GIF animado (video + gifPlayback) */
async function sendReactionImages(client, from, info, urls, caption, mentions = []) {
  if (!urls.length) throw new Error('Nenhuma imagem encontrada')

  for (let i = 0; i < urls.length; i++) {
    const url = urls[i]
    const isFirst = i === 0
    const extra = isFirst
      ? { caption, ...(mentions.length ? { mentions } : {}) }
      : {}

    let payload
    if (isLikelyGif(url)) {
      payload = { video: { url }, gifPlayback: true, ...extra }
    } else {
      payload = { image: { url }, ...extra }
    }

    try {
      await client.sendMessage(from, payload, isFirst ? { quoted: info } : undefined)
    } catch (err) {
      console.error('[reactions] video/gif falhou, tentando image:', err.message)
      await client.sendMessage(
        from,
        { image: { url }, ...extra },
        isFirst ? { quoted: info } : undefined
      )
    }
  }
}'''

if old in content:
    content = content.replace(old, new)
    with open(path, 'w') as f:
        f.write(content)
    print('  patched sendReactionImages')
else:
    print('  padrão antigo não encontrado — verifique manualmente')
PY
  fi
fi

# 2) Fix cmds-aleatorios que mandam image de reação
for f in hugimg kissimg patimg wave wink dance happy cry; do
  FILE="$PROJECT/src/plugins/cmds-aleatorios/${f}.js"
  [[ -f "$FILE" ]] || continue
  mkdir -p "$BACKUP/src/plugins/cmds-aleatorios"
  cp -a "$FILE" "$BACKUP/src/plugins/cmds-aleatorios/" 2>/dev/null || true
  if grep -q 'gifPlayback' "$FILE"; then
    echo "  (já ok) $f"
  else
    perl -i -pe "s/\{ image: \{ url: data\.url \}, caption: (['\\\`\"].*?['\\\`\"]) \}/\{ video: \{ url: data.url \}, gifPlayback: true, caption: \$1 \}/g" "$FILE"
    echo "✅ $f → GIF animado"
  fi
done

# 3) Remover comando .dono (mantém outros plugins de dono)
DONO="$PROJECT/src/plugins/dono/dono.js"
if [[ -f "$DONO" ]]; then
  mkdir -p "$BACKUP/src/plugins/dono"
  mv "$DONO" "$BACKUP/src/plugins/dono/dono.js"
  echo "✅ .dono removido (backup em $BACKUP)"
else
  echo "  .dono já não existe"
fi

# 4) Remover menções a .menu18 em pack.js
PACK="$PROJECT/src/plugins/adulto/pack.js"
if [[ -f "$PACK" ]] && grep -q 'menu18' "$PACK"; then
  mkdir -p "$BACKUP/src/plugins/adulto"
  cp -a "$PACK" "$BACKUP/src/plugins/adulto/"
  # Remove linhas que citam menu18
  perl -i -pe 's/• \.menu18\n?//g; s/\*.menu18\* — ver tudo \+18\n?//g; s/\n• \.menu18//g' "$PACK"
  # Limpa se sobrou texto estranho
  python3 - "$PACK" << 'PY'
import sys, re
path = sys.argv[1]
with open(path) as f:
    t = f.read()
t = re.sub(r'•\s*\.menu18\s*', '', t)
t = re.sub(r'\*.menu18\*[^\n]*\n?', '', t)
t = re.sub(r'\n{3,}', '\n\n', t)
with open(path, 'w') as f:
    f.write(t)
print('✅ pack.js limpo (sem .menu18)')
PY
else
  echo "  pack.js sem menu18 ou já limpo"
fi

# Procurar outros arquivos com menu18
echo ""
echo "Procurando outras menções a menu18..."
grep -rn 'menu18' "$PROJECT/src" --include='*.js' 2>/dev/null | head -10 || echo "  nenhuma"

echo ""
echo "========================================"
echo "Concluído. Backup: $BACKUP"
echo ""
echo "Agora faça commit e push:"
echo "  cd $PROJECT"
echo "  git add -A"
echo "  git commit -m 'fix: reações em GIF animado + remove .dono e .menu18'"
echo "  git push"
echo "========================================"
