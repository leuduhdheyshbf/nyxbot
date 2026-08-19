# Guia de migração V1 → V2

## 1. Sessão WhatsApp

```bash
# Opção A: novo QR
npm start

# Opção B: reutilizar sessão da V1
cp -r /caminho/nyx-bot/database/Nyx-QR ./database/
```

## 2. Config

Edite `config/config.json` com seu número e nomes.  
O prefixo continua `.`.

## 3. Dados JSON

| V1 | V2 |
|----|----|
| `arquivos/json/premium.json` | `database/json/premium.json` (`{ "users": [...] }`) |
| `database/mutes.json` | `database/json/mutes.json` |
| `database/features.json` | `database/json/features.json` |
| `database/xp.json` | integrado em `database/json/users.json` (coins + xp + level) |

Não há conversor automático: se tiver muitos usuários, faça um script simples que leia o XP antigo e chame a estrutura `users[jid]`.

## 4. Plugins

1. Crie a pasta em `src/plugins/<categoria>/`
2. Cole o `.js` da V1
3. Troque a assinatura se necessário:

```js
// V1
async execute({ columbina, from, info, reply, sender, args })

// V2 (compatível — columbina existe)
async execute({ columbina, client, from, info, reply, sender, args, prefix, sendImage, economy, levels, db, config })
```

4. Substitua prefixos fixos `!` por `prefix`
5. Para enviar imagem gerada: `await sendImage('/path/arquivo.png', 'legenda')`

## 5. Dependências extras

Se um plugin V1 usar `canvas`, `ytdl-core`, etc., adicione de volta no `package.json` da V2 e rode `npm install`.

## 6. O que não foi portado automaticamente

- 200+ comandos de resenha/admin/downloads/adulto
- Anti-delete / view-once (pode copiar `arquivos/js/antiDelete.js` e integrar no `messageHandler`)
- Stickers / efeitos / play de música

A arquitetura V2 está pronta para receber esses módulos sem voltar ao monólito.

## 7. Teste rápido

```text
.menu
.ping
.daily
.velha
.dado
.forca
.perfil
```
