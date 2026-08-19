# Usuários no Supabase (níveis, economia, casamento)

## Por quê?
No **Render** o disco é efêmero: a cada deploy o `database/json/users.json` some.
Com Supabase os dados (XP, level, coins, spouse) ficam na nuvem.

## Setup (1 vez)

### 1. Criar tabelas
No painel Supabase → **SQL Editor** → cole e rode:
`docs/SUPABASE_SCHEMA.sql`

### 2. Variáveis de ambiente (Render)
```
SUPABASE_URL=https://xxxx.supabase.co
SUPABASE_ANON_KEY=eyJ...   # ou SUPABASE_SERVICE_KEY (recomendado)
USE_SUPABASE_USERS=1       # default já é ligado; use 0 para voltar ao JSON
```

### 3. Migrar dados antigos (opcional)
Se já tem `database/json/users.json` com dados:
```bash
node scripts/migrate-users-to-supabase.js
```

## O que vai pro Supabase
| Campo | Uso |
|-------|-----|
| jid | ID WhatsApp |
| coins | Economia |
| xp / level | Níveis |
| daily | Last daily claim |
| spouse / married_at | Casamento |
| inventory | Loja |
| achievements | Conquistas |

## O que continua em JSON local
- features, mutes, warns, afk, autoreply, badwords, prefixos_grupo, premium

(Esses são leves; se quiser, depois migrar também.)

## API (compatível)
```js
const u = db.getUser(jid)   // sync (cache)
db.saveUser(jid, { xp: 10, spouse: otherJid })
```

O flush envia pro Supabase a cada ~2s (batch upsert).

## Desligar
```
USE_SUPABASE_USERS=0
```
Volta a usar só `database/json/users.json`.
