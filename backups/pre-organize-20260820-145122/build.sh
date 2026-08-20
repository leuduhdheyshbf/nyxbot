#!/bin/bash

echo "🔧 Baixando dependências externas..."

# 1. Baixar ffmpeg
curl -L https://johnvansickle.com/ffmpeg/releases/ffmpeg-release-amd64-static.tar.xz -o ffmpeg.tar.xz
tar -xf ffmpeg.tar.xz
mv ffmpeg-*/ffmpeg ./ffmpeg
rm -rf ffmpeg-* ffmpeg.tar.xz
chmod +x ffmpeg
echo "✅ ffmpeg baixado!"

# 2. Instalar dependências do Node.js
echo "🚀 Instalando dependências do Node.js..."
yarn add axios
yarn --frozen-lockfile install
echo "✅ Build concluído com sucesso!"
