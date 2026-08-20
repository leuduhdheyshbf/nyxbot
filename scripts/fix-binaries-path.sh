#!/bin/bash
# =============================================================================
# fix-binaries-path.sh
# Corrige chamadas de yt-dlp e ffmpeg nos plugins para usar os binários
# locais (./yt-dlp e ./ffmpeg) baixados pelo build.sh no Render.
#
# Uso (na raiz do projeto):
#   chmod +x fix-binaries-path.sh
#   ./fix-binaries-path.sh
#
# O script:
#   1. Cria backup em backups/plugins-binaries-YYYYMMDD-HHMMSS/
#   2. Altera APENAS arquivos .js em src/plugins/ que contêm os comandos
#   3. Substitui apenas invocações de comando (não comentários, descriptions
#      ou mensagens de erro)
# =============================================================================

set -euo pipefail

ROOT="$(cd "$(dirname "$0")" && pwd)"
PLUGINS_DIR="$ROOT/src/plugins"
TIMESTAMP=$(date +%Y%m%d-%H%M%S)
BACKUP_DIR="$ROOT/backups/plugins-binaries-$TIMESTAMP"
LOG_FILE="$ROOT/fix-binaries-path.log"
TMP_LIST=$(mktemp)

cleanup() { rm -f "$TMP_LIST"; }
trap cleanup EXIT

if [[ ! -d "$PLUGINS_DIR" ]]; then
  echo "❌ Pasta não encontrada: $PLUGINS_DIR"
  echo "   Execute este script na raiz do projeto (onde está a pasta src/)."
  exit 1
fi

echo "=== Fix Binaries Path - $(date) ===" | tee "$LOG_FILE"
echo "Projeto: $ROOT" | tee -a "$LOG_FILE"
echo "Plugins: $PLUGINS_DIR" | tee -a "$LOG_FILE"
echo "" | tee -a "$LOG_FILE"

# Lista de arquivos que realmente contêm yt-dlp ou ffmpeg
find "$PLUGINS_DIR" -type f -name "*.js" -print0 2>/dev/null \
  | xargs -0 grep -l -E 'yt-dlp|ffmpeg' 2>/dev/null > "$TMP_LIST" || true

if [[ ! -s "$TMP_LIST" ]]; then
  echo "✅ Nenhum arquivo .js em src/plugins/ contém 'yt-dlp' ou 'ffmpeg'."
  exit 0
fi

CAND_COUNT=$(wc -l < "$TMP_LIST" | tr -d ' ')
echo "Arquivos candidatos encontrados: $CAND_COUNT" | tee -a "$LOG_FILE"
mkdir -p "$BACKUP_DIR"

MODIFIED=()
SKIPPED=()

while IFS= read -r file; do
  [[ -z "$file" ]] && continue
  rel="${file#$ROOT/}"
  
  # Verifica se realmente tem invocação de comando (não só comentário/texto)
  # Padrões de comando reais observados no projeto:
  #   `yt-dlp ...
  #   `ffmpeg ...
  #   'yt-dlp',
  if ! grep -qE '(`yt-dlp |`ffmpeg |'\''yt-dlp'\'')' "$file"; then
    echo "  ⏭️  Ignorado (sem invocação de comando): $rel" | tee -a "$LOG_FILE"
    SKIPPED+=("$rel")
    continue
  fi

  # Backup
  mkdir -p "$BACKUP_DIR/$(dirname "$rel")"
  cp -a "$file" "$BACKUP_DIR/$rel"
  
  # Substituições precisas (apenas comandos)
  # 1. Template literals / strings de comando: `yt-dlp  →  `./yt-dlp 
  # 2. Template literals / strings de comando: `ffmpeg  →  `./ffmpeg 
  # 3. Array de argumentos: 'yt-dlp'  →  './yt-dlp'
  perl -i -pe '
    s/`yt-dlp /`.\/yt-dlp /g;
    s/`ffmpeg /`.\/ffmpeg /g;
    s/'\''yt-dlp'\''/'\''.\/yt-dlp'\''/g;
  ' "$file"

  # Confirma se algo mudou
  if ! cmp -s "$file" "$BACKUP_DIR/$rel"; then
    echo "  ✅ Modificado: $rel" | tee -a "$LOG_FILE"
    MODIFIED+=("$rel")
  else
    echo "  ℹ️  Sem alteração efetiva: $rel" | tee -a "$LOG_FILE"
    rm -f "$BACKUP_DIR/$rel"
  fi
done < "$TMP_LIST"

# Limpa pastas de backup vazias
find "$BACKUP_DIR" -type d -empty -delete 2>/dev/null || true

echo "" | tee -a "$LOG_FILE"
echo "========================================" | tee -a "$LOG_FILE"
echo "Resumo:" | tee -a "$LOG_FILE"
echo "  Arquivos modificados : ${#MODIFIED[@]}" | tee -a "$LOG_FILE"
echo "  Arquivos ignorados   : ${#SKIPPED[@]}" | tee -a "$LOG_FILE"
echo "  Backup em            : $BACKUP_DIR" | tee -a "$LOG_FILE"
echo "  Log                  : $LOG_FILE" | tee -a "$LOG_FILE"
echo "========================================" | tee -a "$LOG_FILE"

if [[ ${#MODIFIED[@]} -gt 0 ]]; then
  echo "" | tee -a "$LOG_FILE"
  echo "Plugins modificados (teste estes):" | tee -a "$LOG_FILE"
  for m in "${MODIFIED[@]}"; do
    echo "  - $m" | tee -a "$LOG_FILE"
  done
  echo "" | tee -a "$LOG_FILE"
  echo "Para reverter, copie de volta os arquivos do backup:" | tee -a "$LOG_FILE"
  echo "  cp -a \"$BACKUP_DIR/src/plugins/.\" \"$PLUGINS_DIR/\"" | tee -a "$LOG_FILE"
fi

echo ""
echo "✅ Concluído."
