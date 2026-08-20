# Plugin Boas-Vindas — Nyx Bot V2 (Las Vegas)

## Arquivos incluídos

```
src/plugins/admin/bemvindo.js      → comando .bemvindo on/off
src/handlers/groupUpdateHandler.js → envia a mensagem quando alguém entra
src/assets/welcome-default.jpeg    → imagem padrão (gatos)
src/index.js                       → já com o handler registrado
database/json/welcome.json         → arquivo de status (vazio)
```

## Como instalar

1. No seu projeto Nyx Bot V2, **substitua/copie** os arquivos nas pastas correspondentes:
   - `src/plugins/admin/bemvindo.js`
   - `src/handlers/groupUpdateHandler.js`
   - `src/assets/welcome-default.jpeg`
   - `src/index.js` (ou só adicione as 2 linhas do onGroupUpdate se preferir)

2. Se ainda não tiver a pasta, crie:
   ```
   mkdir -p src/assets database/json
   ```

3. Faça commit e redeploy no Render.

4. No grupo:
   ```
   .bemvindo on
   ```

## Comandos

- `.bemvindo on` — ativa
- `.bemvindo off` — desativa
- `.bemvindo status` — vê o status

Aliases: `boasvindas`, `welcome`

## Observação sobre index.js

Se você **não** quiser substituir o index.js inteiro, adicione apenas:

```js
const { handleGroupUpdate } = require('./handlers/groupUpdateHandler')
```

e no `startConnection`:

```js
onGroupUpdate: (ev, sock) => handleGroupUpdate(ev, sock)
```
