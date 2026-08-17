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

Blueprint en `render.yaml`. Servicio web Node con build Vite + Express estático.
