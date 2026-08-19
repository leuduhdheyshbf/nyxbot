#!/bin/bash

echo "🔧 Baixando dependências externas..."

# 1. Baixar yt-dlp (para download de vídeos/músicas)
curl -L https://github.com/yt-dlp/yt-dlp/releases/latest/download/yt-dlp -o yt-dlp
chmod +x yt-dlp
echo "✅ yt-dlp baixado!"

# 2. Baixar ffmpeg (para converter áudio/vídeo, stickers, tomp3, etc.)
curl -L https://johnvansickle.com/ffmpeg/releases/ffmpeg-release-amd64-static.tar.xz -o ffmpeg.tar.xz
tar -xf ffmpeg.tar.xz
mv ffmpeg-*/ffmpeg ./ffmpeg
rm -rf ffmpeg-* ffmpeg.tar.xz
chmod +x ffmpeg
echo "✅ ffmpeg baixado!"

# 3. Instalar dependências do Node.js
echo "🚀 Instalando dependências do Node.js..."
yarn --frozen-lockfile install
echo "✅ Build concluído com sucesso!"

# ==========================================================
# Geração automática de cookies do YouTube
# ==========================================================
echo "🔄 Gerando cookies do YouTube..."
python3 generate_cookies.py || echo "⚠️ Erro ao gerar cookies, mas continuando..."
