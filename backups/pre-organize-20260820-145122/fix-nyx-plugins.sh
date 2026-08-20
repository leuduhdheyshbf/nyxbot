#!/bin/bash

# ============================================================
#  Nyx Bot V2 - Corretor de plugins (caminhos antigos V1)
#  Uso: rode na pasta raiz do bot (onde está o package.json)
# ============================================================

set -euo pipefail

# Cores
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

# Diretórios
PLUGINS_DIR="src/plugins"
BACKUP_DIR="backup_plugins_$(date +%Y%m%d_%H%M%S)"
LOG_FILE="fix-plugins.log"

echo -e "${BLUE}========================================${NC}"
echo -e "${BLUE}  Nyx Bot V2 - Fix de Plugins (V1 → V2)${NC}"
echo -e "${BLUE}========================================${NC}"
echo ""

# Verifica se está na pasta correta
if [[ ! -d "$PLUGINS_DIR" ]]; then
    echo -e "${RED}[ERRO] Pasta $PLUGINS_DIR não encontrada!${NC}"
    echo "Execute este script na raiz do bot (onde está o package.json e a pasta src/)."
    exit 1
fi

# Cria pasta de backup
mkdir -p "$BACKUP_DIR"
echo -e "${GREEN}[✓] Backup será salvo em: $BACKUP_DIR${NC}"
echo ""

# Inicializa log
echo "=== Fix Nyx Plugins - $(date) ===" > "$LOG_FILE"

# Contadores
TOTAL=0
MODIFICADOS=0
SHARP_DETECTADO=0

# --------------------------------------------------
# 1. Função de substituição segura
# --------------------------------------------------
fix_file() {
    local file="$1"
    local changed=0

    # Backup do arquivo
    mkdir -p "$BACKUP_DIR/$(dirname "$file")"
    cp "$file" "$BACKUP_DIR/$file"

    # Substituições - exports.js
    if grep -q "../../arquivos/js/exports.js" "$file"; then
        sed -i "s|require(['\"]\.\./\.\./arquivos/js/exports\.js['\"])|require('exports.js')|g" "$file"
        sed -i "s|from ['\"]\.\./\.\./arquivos/js/exports\.js['\"]|from 'exports.js'|g" "$file"
        changed=1
        echo "  → Corrigido exports.js" | tee -a "$LOG_FILE"
    fi

    # Substituições - exif2.js
    if grep -q "../../arquivos/js/exif2.js" "$file"; then
        if [[ -f "src/core/exif2.js" ]] || [[ -f "src/utils/exif2.js" ]] || [[ -f "src/lib/exif2.js" ]]; then
            sed -i "s|require(['\"]\.\./\.\./arquivos/js/exif2\.js['\"])|require('exif2.js')|g" "$file"
            sed -i "s|from ['\"]\.\./\.\./arquivos/js/exif2\.js['\"]|from 'exif2.js'|g" "$file"
            echo "  → Corrigido exif2.js (arquivo encontrado na V2)" | tee -a "$LOG_FILE"
        else
            # Se não existir, comenta a linha de require para não quebrar
            sed -i "s|.*require(['\"]\.\./\.\./arquivos/js/exif2\.js['\"]).*|// [NyxFix] require de exif2.js removido (não existe na V2)|g" "$file"
            sed -i "s|.*from ['\"]\.\./\.\./arquivos/js/exif2\.js['\"].*|// [NyxFix] import de exif2.js removido (não existe na V2)|g" "$file"
            echo "  → exif2.js não encontrado → dependência comentada" | tee -a "$LOG_FILE"
        fi
        changed=1
    fi

    # Outros caminhos comuns da V1
    if grep -q "../../arquivos/js/" "$file"; then
        sed -i "s|require(['\"]\.\./\.\./arquivos/js/\([^'\"]*\)['\"])|require('\1')|g" "$file"
        sed -i "s|from ['\"]\.\./\.\./arquivos/js/\([^'\"]*\)['\"]|from '\1'|g" "$file"
        changed=1
        echo "  → Outros caminhos ../../arquivos/js/ corrigidos" | tee -a "$LOG_FILE"
    fi

    if [[ $changed -eq 1 ]]; then
        ((MODIFICADOS++)) || true
        echo -e "${GREEN}[MODIFICADO] $file${NC}"
    fi
}

# --------------------------------------------------
# 2. Percorre todos os plugins
# --------------------------------------------------
echo -e "${YELLOW}[*] Procurando plugins com caminhos antigos...${NC}"
echo ""

while IFS= read -r -d '' file; do
    ((TOTAL++)) || true
    if grep -qE "../../arquivos/js/(exports|exif2)\.js" "$file" 2>/dev/null; then
        echo -e "${BLUE}→ Analisando: $file${NC}"
        fix_file "$file"
    fi

    # Detecta uso de sharp
    if grep -qE "require\(['\"]sharp['\"]\)|from ['\"]sharp['\"]" "$file" 2>/dev/null; then
        ((SHARP_DETECTADO++)) || true
        echo -e "${YELLOW}[SHARP] $file usa a biblioteca sharp${NC}"
    fi
done < <(find "$PLUGINS_DIR" -type f -name "*.js" -print0)

echo ""
echo -e "${GREEN}[✓] Arquivos analisados: $TOTAL${NC}"
echo -e "${GREEN}[✓] Arquivos modificados: $MODIFICADOS${NC}"
echo ""

# --------------------------------------------------
# 3. Instala sharp se necessário
# --------------------------------------------------
if [[ $SHARP_DETECTADO -gt 0 ]]; then
    echo -e "${YELLOW}[*] $SHARP_DETECTADO plugin(s) usam 'sharp'. Verificando instalação...${NC}"

    if ! node -e "require('sharp')" 2>/dev/null; then
        echo -e "${YELLOW}[!] sharp não está instalado. Instalando agora...${NC}"
        npm install sharp --save
        echo -e "${GREEN}[✓] sharp instalado com sucesso${NC}"
    else
        echo -e "${GREEN}[✓] sharp já está instalado${NC}"
    fi
fi

# --------------------------------------------------
# 4. Cria fallback de carregamento seguro de plugins
# --------------------------------------------------
FALLBACK_FILE="src/core/safePluginLoader.js"

echo -e "${YELLOW}[*] Criando loader seguro de plugins...${NC}"

mkdir -p src/core

cat > "$FALLBACK_FILE" << 'EOF'
/**
 * Nyx Bot V2 - Safe Plugin Loader
 * Impede que um plugin quebrado derrube o bot inteiro.
 */

const fs = require('fs');
const path = require('path');

function loadPluginsSafely(pluginsDir, onError = console.error) {
    const loaded = [];
    const failed = [];

    if (!fs.existsSync(pluginsDir)) {
        console.warn(`[SafeLoader] Pasta de plugins não encontrada: ${pluginsDir}`);
        return { loaded, failed };
    }

    function walk(dir) {
        const files = fs.readdirSync(dir, { withFileTypes: true });

        for (const file of files) {
            const fullPath = path.join(dir, file.name);

            if (file.isDirectory()) {
                walk(fullPath);
            } else if (file.name.endsWith('.js')) {
                try {
                    // Limpa cache do require para permitir hot-reload se necessário
                    delete require.cache[require.resolve(fullPath)];
                    const plugin = require(fullPath);

                    if (plugin && (typeof plugin === 'object' || typeof plugin === 'function')) {
                        loaded.push({ path: fullPath, plugin });
                        console.log(`[SafeLoader] ✓ Carregado: ${path.relative(process.cwd(), fullPath)}`);
                    }
                } catch (err) {
                    failed.push({ path: fullPath, error: err.message });
                    onError(`[SafeLoader] ✗ Falha ao carregar ${path.relative(process.cwd(), fullPath)}: ${err.message}`);
                    // Continua para o próximo plugin
                }
            }
        }
    }

    walk(pluginsDir);

    console.log(`[SafeLoader] Resultado: ${loaded.length} ok | ${failed.length} falharam`);
    return { loaded, failed };
}

module.exports = { loadPluginsSafely };
EOF

echo -e "${GREEN}[✓] Loader seguro criado em: $FALLBACK_FILE${NC}"
echo ""
echo -e "${YELLOW}IMPORTANTE:${NC}"
echo "No seu arquivo principal de carregamento de plugins (ex: index.js, bot.js ou src/core/pluginManager.js),"
echo "substitua o require normal dos plugins por:"
echo ""
echo -e "${BLUE}const { loadPluginsSafely } = require('./core/safePluginLoader');${NC}"
echo -e "${BLUE}const { loaded, failed } = loadPluginsSafely(path.join(__dirname, '../plugins'));${NC}"
echo ""

# --------------------------------------------------
# 5. Relatório final
# --------------------------------------------------
echo -e "${BLUE}========================================${NC}"
echo -e "${GREEN}  CONCLUÍDO${NC}"
echo -e "${BLUE}========================================${NC}"
echo "• Backup completo: $BACKUP_DIR"
echo "• Log detalhado: $LOG_FILE"
echo "• Arquivos modificados: $MODIFICADOS"
echo "• Plugins com sharp: $SHARP_DETECTADO"
echo ""
echo -e "${YELLOW}Próximos passos recomendados:${NC}"
echo "1. Verifique se exports.js e exif2.js estão acessíveis via NODE_PATH ou em src/core ou src/utils"
echo "2. Adicione no package.json (ou no início do bot):"
echo "   NODE_PATH=./src/core:./src/utils:./src/lib node index.js"
echo "3. Ou use require relativos corretos após o fix"
echo "4. Teste o bot com: node index.js (ou o comando que você usa)"
echo ""
echo -e "${GREEN}Se algo der errado, restaure o backup com:${NC}"
echo "  cp -r $BACKUP_DIR/* ."
echo ""
