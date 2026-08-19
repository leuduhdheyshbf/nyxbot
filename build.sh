#!/bin/bash

echo "🔧 Baixando dependências externas..."

# 1. Baixar ffmpeg (para conversões, áudios, stickers, etc.)
curl -L https://johnvansickle.com/ffmpeg/releases/ffmpeg-release-amd64-static.tar.xz -o ffmpeg.tar.xz
tar -xf ffmpeg.tar.xz
mv ffmpeg-*/ffmpeg ./ffmpeg
rm -rf ffmpeg-* ffmpeg.tar.xz
chmod +x ffmpeg
echo "✅ ffmpeg baixado!"

# 2. Instalar dependências do Node.js (incluindo o axios)
echo "🚀 Instalando dependências do Node.js..."
yarn add axios
yarn --frozen-lockfile install
echo "✅ Build concluído com sucesso!"
```[cite: 2]

Basta atualizar o arquivo no seu projeto com esse código e fazer o novo deploy!
