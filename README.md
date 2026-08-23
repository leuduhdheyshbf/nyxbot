# 🩸 Nyx Bot V2

Base WhatsApp modular com plugins, economia, níveis e jogos com imagem.

## 🚀 DockHosting

Esta edição foi limpa para hospedagem: backups, `.git`, sessões WhatsApp, dados locais antigos e arquivos de correção/migração foram removidos.

### Comandos do painel

**Instalar:**
```bash
npm install
```

**Build:** deixe vazio.

**Diretório de saída:** deixe vazio.

**Root:** `/`

**Iniciar:**
```bash
npm start
```

**Pairing code:**
```bash
npm run start:code
```

### Variáveis recomendadas

- `OWNER_NUMBER` — número do dono em formato internacional, somente números.
- `OWNER_NAME` — nome do dono (opcional).
- `BOT_NAME` — nome da bot (opcional).
- `WELCOME_GROUP_ID` — opcional; limita o welcome a um grupo.
- `SUPABASE_URL`, `SUPABASE_ANON_KEY` ou `SUPABASE_SERVICE_KEY` — opcionais para substituir a configuração padrão do projeto.

O `npm install` prepara o FFmpeg automaticamente por `ffmpeg-static`. Não é necessário `sudo`, `apt`, `pacman` ou `build.sh`.

### Primeiro acesso

1. Faça o deploy.
2. Para QR, use `npm start`.
3. Para código, use `npm run start:code` e configure `OWNER_NUMBER`.
4. A sessão será criada em `database/Nyx-QR/`.

**Não compartilhe `database/Nyx-QR/` nem publique os arquivos da sessão.**

## Estrutura

- `src/index.js` — entrada do bot e health check HTTP.
- `src/core/` — conexão, comandos, banco e logs.
- `src/plugins/` — comandos.
- `src/modules/` — economia, níveis e jogos.
- `database/json/` — fallback local.
- `database/Nyx-QR/` — sessão criada em runtime.
