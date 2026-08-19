#!/bin/bash

echo "🔧 Instalando dependências do sistema..."

# Atualiza a lista de pacotes e instala os programas essenciais
apt-get update
apt-get install -y \
  yt-dlp \
  ffmpeg \
  wget \
  curl \
  git \
  build-essential \
  python3 \
  python3-pip

echo "✅ Dependências do sistema instaladas!"

# (Opcional) Baixa o yt-dlp manualmente se o apt não tiver a versão mais recente
# curl -L https://github.com/yt-dlp/yt-dlp/releases/latest/download/yt-dlp -o yt-dlp
# chmod +x yt-dlp

echo "🚀 Instalando dependências do Node.js..."
yarn --frozen-lockfile install

echo "✅ Build concluído com sucesso!"
