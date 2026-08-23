#!/bin/bash

echo "=============================================="
echo "  Nyx Bot - Correção de Deploy (Render)"
echo "=============================================="
echo

# 1. Verifica se está na pasta certa
if [ ! -f "package.json" ]; then
  echo "❌ package.json não encontrado. Rode este script na raiz do projeto."
  exit 1
fi

# 2. Faz backup do package.json
cp package.json package.json.bak
echo "✅ Backup criado: package.json.bak"

# 3. Atualiza o Baileys para a versão segura
echo "🔄 Atualizando @whiskeysockets/baileys para 7.0.0-rc.12..."
sed -i 's/"@whiskeysockets\/baileys": "7.0.0-rc.9"/"@whiskeysockets\/baileys": "7.0.0-rc.12"/' package.json

# 4. Remove o canvas (evita problemas de compilação no Render)
echo "🗑️  Removendo canvas..."
# Remove do package.json
sed -i '/"canvas":/d' package.json
# Remove a vírgula sobrando se necessário
sed -i 's/,\s*}/}/g' package.json

# 5. Remove lockfiles antigos
echo "🗑️  Removendo lockfiles antigos..."
rm -f yarn.lock package-lock.json

# 6. Instala com npm (recomendado)
echo "📦 Instalando dependências com npm..."
npm install

# 7. Verifica se o Baileys foi atualizado
BAILEYS_VERSION=$(node -p "require('./node_modules/@whiskeysockets/baileys/package.json').version" 2>/dev/null || echo "não encontrado")

if [[ "$BAILEYS_VERSION" == "7.0.0-rc.12" || "$BAILEYS_VERSION" > "7.0.0-rc.12" ]]; then
  echo "✅ Baileys atualizado com sucesso: $BAILEYS_VERSION"
else
  echo "⚠️  Atenção: versão do Baileys ainda é $BAILEYS_VERSION"
fi

# 8. Verifica se o canvas foi removido
if grep -q '"canvas"' package.json; then
  echo "⚠️  Canvas ainda está no package.json"
else
  echo "✅ Canvas removido com sucesso"
fi

echo
echo "=============================================="
echo "  Pronto! Agora faça o commit e push:"
echo
echo "  git add package.json package-lock.json"
echo "  git commit -m \"fix: bump Baileys to rc12 + remove canvas + lockfile\""
echo "  git push"
echo
echo "  Depois altere no Render:"
echo "  - Build Command → npm install"
echo "  - Start Command → npm start"
echo "=============================================="
