# MQTT — Tótem (Render) ↔ ESP32 (LED / puerta)

## Importante: el tótem está en Render.com

Las instrucciones de instalar Mosquitto **en el PC del tótem** aplican solo si el agente Node corre **en ese mismo PC** (desarrollo local o kiosco on‑site).

Si el tótem está desplegado en **Render**, **no puedes dar tu IP local** (`192.168.x.x`) al compañero del ESP32: Render está en la nube y no tiene acceso a tu red WiFi doméstica/faena.

### Arquitectura correcta con Render

```
[ Tótem Render ] ──WiFi/Internet──► [ Broker MQTT en la nube ] ◄──WiFi── [ ESP32 + LED ]
```

**Ambos** se conectan al **mismo broker**, visible desde Internet:

| Escenario | Broker | URL ejemplo |
|-----------|--------|-------------|
| **Producción (Render)** | HiveMQ Cloud, CloudMQTT, EMQX Cloud, Mosquitto en VPS | `mqtt://usuario:pass@xxx.s1.eu.hivemq.cloud:1883` |
| **Prueba en laboratorio** | Mosquitto en tu PC | `mqtt://192.168.1.50:1883` (solo si el tótem corre local con `npm start`) |

---

## Contrato (idéntico en ambos lados)

| Dato | Valor |
|------|--------|
| **Topic** | `totem/led` |
| **Encender** | `on` |
| **Apagar** | `off` |

Variable de entorno en Render:

```env
MQTT_BROKER_URL=mqtt://HOST:1883
MQTT_TOPIC_LED=totem/led
```

---

## Qué hace el código del tótem

1. Al arrancar `server.js`, conecta al broker (`initMqtt`).
2. Endpoints:
   - `POST /api/mqtt/led/on` → publica `on` en `totem/led`
   - `POST /api/mqtt/led/off` → publica `off`
   - `GET /api/mqtt/status` → estado de conexión MQTT
3. En la pantalla de bienvenida, micrófono: *«encender led»* → API → MQTT → ESP32.
4. El avatar responde *«Listo»* por TTS.

---

## Configuración Render

1. Render → **prevencionstracon** → **Environment**
2. Agregar `MQTT_BROKER_URL` con la URL del broker en la nube
3. **Manual Deploy** (reinicia el servicio Node)

Health: `GET /api/mqtt/status`

Prueba sin voz:

```bash
curl -X POST https://prevencionstracon.onrender.com/api/mqtt/led/on
```

---

## Qué pasarle al técnico del ESP32

- **Broker (IP:puerto)** → host público del broker en la nube (no tu IP local si usas Render)
- **Topic** → `totem/led`
- **Mensajes** → `on` / `off`

El ESP32 debe suscribirse a `totem/led` en ese broker (misma WiFi con salida a Internet basta).

---

## Prueba local (sin Render)

1. Instalar Mosquitto en Windows (ver instrucciones del técnico).
2. `.env.local`:
   ```env
   MQTT_BROKER_URL=mqtt://localhost:1883
   ```
3. `npm run build && npm start` (no solo `npm run dev` para MQTT completo; dev también proxy MQTT en Vite).
4. Verificar:
   ```cmd
   mosquitto_sub -h localhost -t totem/led
   curl -X POST http://localhost:5200/api/mqtt/led/on
   ```

---

## Broker gratuito de prueba (rápido)

- [HiveMQ Cloud](https://www.hivemq.com/mqtt-cloud-broker/) — plan free, URL tipo `xxx.s1.eu.hivemq.cloud`
- Crear cluster → copiar URL → poner en `MQTT_BROKER_URL` en Render y en el firmware ESP32

**No uses brokers públicos anónimos en producción faena** (sin auth). Para demo sí sirven.
