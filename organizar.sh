#!/bin/bash
# ============================================================
#  Nyx Bot V2 — organizar.sh
#  Reorganiza arquivos soltos sem quebrar o bot
# ============================================================
set -euo pipefail

GREEN='\033[0;32m'
CYAN='\033[0;36m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

ROOT="$(pwd)"

if [ ! -f "$ROOT/package.json" ] || [ ! -d "$ROOT/src" ]; then
  echo -e "${RED}❌ Execute na raiz do Nyx Bot V2 (onde está package.json e src/)${NC}"
  exit 1
fi

echo -e "${CYAN}╔══════════════════════════════════════════╗${NC}"
echo -e "${CYAN}║   Nyx Bot V2 — Organizador de pastas     ║${NC}"
echo -e "${CYAN}╚══════════════════════════════════════════╝${NC}"
echo -e "Raiz: $ROOT"
echo ""

# ---------- 1. BACKUP ----------
STAMP=$(date +%Y%m%d-%H%M%S)
BACKUP_DIR="$ROOT/backups/pre-organize-$STAMP"
mkdir -p "$BACKUP_DIR"
echo -e "${YELLOW}📦 Backup em: backups/pre-organize-$STAMP${NC}"

# Copia só o que vamos mexer (não mexe em database/Nyx-QR, node_modules, temp, .git)
for item in \
  ANALISE_V1.md COMO-USAR.txt INSTALACAO.md README.md \
  apply-gif-reactions.sh build.sh deploy.sh \
  exif2.js \
  fix-binaries-path.sh fix-binaries-path.log \
  fix-nyx-plugins.sh fix-plugins.log \
  plugins-v2 nyx-bemvindo-plugin \
  src/index.js.bak-bemvindo
do
  if [ -e "$ROOT/$item" ]; then
    cp -a "$ROOT/$item" "$BACKUP_DIR/" 2>/dev/null || true
  fi
done
echo -e "${GREEN}  ✓ Backup ok${NC}"
echo ""

# ---------- 2. CRIAR PASTAS ----------
mkdir -p \
  "$ROOT/docs" \
  "$ROOT/scripts" \
  "$ROOT/config" \
  "$ROOT/backups/logs" \
  "$ROOT/backups/plugins-v2" \
  "$ROOT/backups/plugins-extra" \
  "$ROOT/database/json" \
  "$ROOT/src/plugins/admin" \
  "$ROOT/src/handlers" \
  "$ROOT/src/assets"

echo -e "${CYAN}→ Pastas criadas${NC}"

# ---------- helper ----------
move_safe() {
  local src="$1"
  local dest="$2"
  if [ ! -e "$ROOT/$src" ]; then
    return 0
  fi
  mkdir -p "$(dirname "$ROOT/$dest")"
  if [ -e "$ROOT/$dest" ]; then
    echo -e "  ${YELLOW}↷ já existe, pulando: $dest${NC}"
    return 0
  fi
  mv "$ROOT/$src" "$ROOT/$dest"
  echo -e "  ${GREEN}✓${NC} $src  →  $dest"
}

# ---------- 3. DOCS ----------
echo -e "${CYAN}→ Documentação → docs/${NC}"
move_safe "ANALISE_V1.md"   "docs/ANALISE_V1.md"
move_safe "COMO-USAR.txt"   "docs/COMO-USAR.txt"
move_safe "INSTALACAO.md"   "docs/INSTALACAO.md"
# README.md fica na raiz (padrão)

# ---------- 4. SCRIPTS ----------
echo -e "${CYAN}→ Scripts → scripts/${NC}"
move_safe "apply-gif-reactions.sh" "scripts/apply-gif-reactions.sh"
move_safe "fix-binaries-path.sh"   "scripts/fix-binaries-path.sh"
move_safe "fix-nyx-plugins.sh"     "scripts/fix-nyx-plugins.sh"
move_safe "exif2.js"               "scripts/exif2.js"
# build.sh e deploy.sh ficam na RAIZ (Render usa build.sh)

# ---------- 5. LOGS ----------
echo -e "${CYAN}→ Logs → backups/logs/${NC}"
move_safe "fix-binaries-path.log" "backups/logs/fix-binaries-path.log"
move_safe "fix-plugins.log"       "backups/logs/fix-plugins.log"

# ---------- 6. BACKUPS / CÓPIAS ANTIGAS ----------
echo -e "${CYAN}→ Cópias antigas → backups/${NC}"
move_safe "src/index.js.bak-bemvindo" "backups/index.js.bak-bemvindo"

if [ -d "$ROOT/plugins-v2" ]; then
  # move conteúdo para backups/plugins-v2
  shopt -s dotglob nullglob
  for f in "$ROOT/plugins-v2"/*; do
    base=$(basename "$f")
    if [ ! -e "$ROOT/backups/plugins-v2/$base" ]; then
      mv "$f" "$ROOT/backups/plugins-v2/"
      echo -e "  ${GREEN}✓${NC} plugins-v2/$base  →  backups/plugins-v2/$base"
    fi
  done
  rmdir "$ROOT/plugins-v2" 2>/dev/null || mv "$ROOT/plugins-v2" "$ROOT/backups/plugins-v2-rest" 2>/dev/null || true
  shopt -u dotglob nullglob
fi

if [ -d "$ROOT/nyx-bemvindo-plugin" ]; then
  # Plugin já está instalado em src/ — arquiva a pasta solta
  if [ ! -e "$ROOT/backups/plugins-extra/nyx-bemvindo-plugin" ]; then
    mv "$ROOT/nyx-bemvindo-plugin" "$ROOT/backups/plugins-extra/nyx-bemvindo-plugin"
    echo -e "  ${GREEN}✓${NC} nyx-bemvindo-plugin/  →  backups/plugins-extra/nyx-bemvindo-plugin/"
  else
    echo -e "  ${YELLOW}↷ backups/plugins-extra/nyx-bemvindo-plugin já existe${NC}"
  fi
fi

# ---------- 7. NÃO MEXER ----------
echo ""
echo -e "${YELLOW}Protegidos (não movidos):${NC}"
echo "  • src/          (código do bot)"
echo "  • database/     (JSON + sessão Nyx-QR)"
echo "  • config/       (config.json)"
echo "  • package.json / yarn.lock"
echo "  • build.sh      (raiz — Render)"
echo "  • node_modules/ temp/ .git/  (se existirem)"

# ---------- 8. RESUMO ----------
echo ""
echo -e "${GREEN}╔══════════════════════════════════════════╗${NC}"
echo -e "${GREEN}║         Organização concluída            ║${NC}"
echo -e "${GREEN}╚══════════════════════════════════════════╝${NC}"
echo ""
echo "Estrutura final esperada:"
echo "  config/          config.json"
echo "  src/             bot (core, handlers, plugins, ...)"
echo "  database/        json + sessão"
echo "  docs/            documentação"
echo "  scripts/         utilitários .sh / .js"
echo "  backups/         arquivos antigos e logs"
echo "  package.json     yarn.lock  build.sh  README.md"
echo ""
echo -e "Backup completo em: ${CYAN}backups/pre-organize-$STAMP${NC}"
echo "Se algo der errado: cp -a backups/pre-organize-$STAMP/* ."
echo ""
echo "Reinicie o bot / faça redeploy no Render."
