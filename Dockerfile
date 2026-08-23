FROM node:22-slim

# Aumenta o limite de arquivos
RUN echo "fs.file-max = 65536" >> /etc/sysctl.conf

# Instala dependências
RUN apt-get update && apt-get install -y \
    build-essential \
    libcairo2-dev \
    libjpeg-dev \
    libpango1.0-dev \
    libgif-dev \
    librsvg2-dev \
    ffmpeg \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

COPY package*.json ./
RUN npm install --ignore-engines

COPY . .

EXPOSE 8080

CMD ["npm", "start"]
