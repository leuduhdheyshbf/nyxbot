# Usa a imagem oficial Node.js 18 LTS (leve e compatível)
FROM node:18-slim

# Instala dependências de sistema necessárias:
# - ffmpeg (para conversão de vídeos/áudios)
# - build-essential, python3, libglib2.0-0, libpng-dev, etc. (para canvas, sharp e outras libs)
RUN apt-get update && apt-get install -y \
    ffmpeg \
    build-essential \
    python3 \
    libglib2.0-0 \
    libpng-dev \
    libjpeg-dev \
    libwebp-dev \
    libtiff-dev \
    libgif-dev \
    librsvg2-dev \
    && rm -rf /var/lib/apt/lists/*

# Define o diretório de trabalho dentro do container
WORKDIR /app

# Copia apenas os arquivos de dependência primeiro (para aproveitar o cache)
COPY package*.json ./

# Instala as dependências do Node.js (incluindo canvas, sharp, etc.)
RUN npm install --omit=dev

# Copia todo o resto do código (exceto o que estiver no .dockerignore)
COPY . .

# Expõe a porta que o servidor HTTP vai usar (definida no seu index.js)
EXPOSE 8080

# Comando para iniciar o bot (usando o script "start" do package.json)
CMD ["npm", "start"]
