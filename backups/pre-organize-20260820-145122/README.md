# 🩸 Nyx Bot V2

Base WhatsApp reescrita a partir da **Nyx Bot V1** (MisheruModz / LCSX), com core modular, economia, níveis e **jogos com imagem (Jimp)**.

**Prefixo padrão:** `.` (ponto)

---

## ✨ O que mudou na V2

| Antes (V1) | Agora (V2) |
|------------|------------|
| `index.js` ~1000 linhas | Core separado: client, commands, database, handlers |
| JSON lido a cada mensagem | Cache + flush debounced (2s) |
| Jogos só texto | Jogos com imagem Jimp (velha, forca, memória, quiz, dado, moeda, adivinha) |
| Sem economia | Daily, saldo, loja, transferência (base) |
| XP básico | Níveis com curva configurável + rank |
| Menu estático | Menu gótico dinâmico |
| Cooldown inconsistente | Cooldown central no CommandManager |
| Plugins OK | Mesmo contrato de plugin (compatível) |

---

## 📁 Estrutura

```
nyx-bot-v2/
├── config/config.json
├── database/
│   ├── json/          # dados persistidos
│   ├── backups/
│   └── Nyx-QR/        # sessão Baileys (criada no 1º login)
├── public/
├── src/
│   ├── index.js
│   ├── core/          # client, commands, database, cache, logger
│   ├── handlers/      # messageHandler
│   ├── modules/       # economy, levels, games
│   ├── plugins/       # admin, dono, utilidades, jogos, ...
│   └── utils/
├── temp/              # imagens geradas (limpeza automática)
├── package.json
├── ANALISE_V1.md
└── README.md
```

---

## 🚀 Instalação

```bash
cd nyx-bot-v2
npm install

# Edite o dono e o nome:
# config/config.json → NumeroDoDono, NomeDoBot, NomeDoDono

# QR Code:
npm start

# Ou pairing code (usa NumeroDoDono):
npm run start:code
```

Requisitos: Node.js 18+, ffmpeg no PATH (para áudio/sticker se portar plugins de mídia).

---

## 🎮 Comandos incluídos nesta base

### Jogos (imagem)
- `.velha` / `.velha [1-9]` / `.velha sair`
- `.forca` / `.forca [letra]`
- `.memoria` / `.memoria [1-8]`
- `.adivinha` / `.adivinha [n]`
- `.quiz` / `.quiz A|B|C|D`
- `.dado`
- `.moeda`

### Economia / perfil
- `.daily` — recompensa diária
- `.saldo` — NyxCoins
- `.loja` / `.loja [id]`
- `.perfil`
- `.rank`

### Util
- `.menu` — menu gótico
- `.ping`
- `.dono`

---

## 🧩 Como criar um plugin

```js
// src/plugins/diversao/exemplo.js
module.exports = {
  name: 'exemplo',
  description: 'Meu comando',
  category: 'diversao',
  aliases: ['ex'],
  cooldown: 5,
  premium: false,
  admin: false,
  dono: false,
  needBotAdmin: false,
  async execute({ client, from, sender, args, reply, react, sendImage, config, db, economy, levels, prefix }) {
    await reply('Olá da V2!')
  }
}
```

Hot-reload: salvar o arquivo recarrega os plugins automaticamente.

### Migrar plugin da V1

A V1 passava `{ columbina, from, info, reply, reagir, sender, args, prefix }`.  
Na V2 o contexto inclui os mesmos nomes (`columbina` é alias de `client`) **mais** `economy`, `levels`, `db`, `sendImage`, `config`.

Na maioria dos casos: **copie o arquivo para `src/plugins/<categoria>/` e ajuste o prefixo hardcoded (`!` → use `prefix`)**.

---

## ⚙️ Config (`config/config.json`)

- `prefix` — padrão `.`
- `NumeroDoDono` — só números com DDI
- `moeda.dailyMin` / `dailyMax`
- `niveis.xpBase` / `multiplicador`
- `tempCleanupMinutes`

---

## 🔐 Segurança (melhorias)

- Cooldown por usuário+comando (dono isento)
- Flags `admin` / `dono` / `premium` / `needBotAdmin` no plugin
- Validação central antes de `execute`
- Escrita de DB não bloqueia a cada mensagem
- Limpeza de `temp/`

Ainda recomendado: não expor a pasta do bot publicamente; backup de `database/json`.

---

## 📦 Migração V1 → V2

1. Instale a V2 e conecte a sessão (ou copie `database/Nyx-QR` da V1 se quiser a mesma conta).
2. Copie dados úteis: premium, mutes, warns → formato similar em `database/json/`.
3. Porte plugins aos poucos: comece por `admin` e `downloads`.
4. Substitua `!comando` nos textos por `` `${prefix}comando` ``.
5. Para stickers/mídia, reutilize `exif2` / ffmpeg da V1 dentro de `src/utils` se necessário.

Detalhes da análise: veja **ANALISE_V1.md**.

---

## 📝 Créditos

- Base original V1: **MisheruModz**
- Customização / contato V1 no projeto: **LCSX**
- V2: reescrita modular com jogos em imagem e sistemas de economia/níveis

Use a base, evolua seu bot e mantenha os créditos da base original.
