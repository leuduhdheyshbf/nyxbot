# Nyx Bot V2 — DockHosting

## Configuração do projeto

**Instalar comando**
```bash
npm install
```

**Construir comando**
Deixe vazio.

**Diretório de saída**
Deixe vazio.

**Diretório Root**
```text
/
```

**Comando iniciar**
```bash
npm start
```

Para usar pairing code:
```bash
npm run start:code
```

## Variáveis recomendadas

Configure no painel:

- `OWNER_NUMBER` — número do dono, somente dígitos e com DDI.
- `OWNER_NAME` — nome do dono (opcional).
- `BOT_NAME` — nome da bot (opcional).

O projeto prepara o FFmpeg automaticamente durante `npm install` usando `ffmpeg-static`; não é necessário `sudo`, `apt`, `pacman` ou um `build.sh`.

## Primeiro login

1. Faça o deploy.
2. Veja os logs.
3. Com `npm start`, use o QR exibido no log.
4. Com `npm run start:code`, o código de pareamento aparece no log.
5. A sessão é salva em `database/Nyx-QR/`.

**Não envie a pasta `database/Nyx-QR/` para GitHub nem compartilhe seus arquivos de sessão.**
