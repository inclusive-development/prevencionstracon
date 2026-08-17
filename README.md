# Tótem Prevención — Stracon

Tótem de ingreso a faena con acreditación documental y verificación de EPP, con branding Stracon.

## Desarrollo local

```bash
npm install
npm run dev    # Vite + proxy /api/tts
# o producción local:
npm run build && npm start
```

http://localhost:5200 — health: http://localhost:5200/api/health

## Datos demo

| Rol | RUT | Nombre |
|-----|-----|--------|
| Empresa | 76.485.491-8 | Stracon |
| Trabajador acreditado | 24.827.796-3 | Tanya Medina |
| Trabajador rechazado | 12.345.678-5 | María González |

## TTS (Google vía backend)

El navegador llama **`POST /api/tts`**. Express llama a Google con la key **solo en el servidor** (sin 403 por referrer).

En Render → Environment:

```env
GOOGLE_TTS_API_KEY=tu_key
VITE_GOOGLE_TTS_API_KEY=tu_key
```

**Redeploy** después de cambiar variables (Vite embebe `VITE_` en el build).

## Deploy (Render)

Blueprint en [`render.yaml`](render.yaml). **Web Service Node** (no Static Site): Express sirve la SPA y el proxy `/api/tts`.

1. Repo: [inclusive-development/prevencionstracon](https://github.com/inclusive-development/prevencionstracon)
2. Render → **New** → **Blueprint** → conectar el repo
3. Render crea el servicio `prevencionstracon` automáticamente
4. En **Environment**, agrega:
   - `GOOGLE_TTS_API_KEY` — TTS en servidor
   - `VITE_GOOGLE_TTS_API_KEY` — misma key (build Vite + fallback navegador)
5. **Manual Deploy** o espera auto-deploy en push a `master`

Verifica logs al arrancar: `TTS key: ok`

Verifica en el navegador: `https://TU-URL.onrender.com/api/health` → `{"ok":true,"tts":true}`

### Google Cloud — referentes HTTP

Agrega la URL de Render a los referentes de la API key:

```
https://prevencionstracon.onrender.com/*
https://*.onrender.com/*
http://localhost:5200/*
```
