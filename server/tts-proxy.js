/** API key solo en servidor — no en el bundle del navegador. */
export function getTtsApiKey() {
  return process.env.GOOGLE_TTS_API_KEY || process.env.VITE_GOOGLE_TTS_API_KEY || ''
}

export async function proxyTtsSynthesis(body) {
  const key = getTtsApiKey()
  if (!key) {
    return { status: 503, data: { error: 'TTS not configured on server' } }
  }

  const res = await fetch(
    `https://texttospeech.googleapis.com/v1/text:synthesize?key=${key}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    },
  )

  const raw = await res.text()
  let data = {}
  if (raw) {
    try {
      data = JSON.parse(raw)
    } catch {
      data = { error: raw.slice(0, 200) }
    }
  }

  return { status: res.status, data }
}

export async function handleTtsRequest(req, res) {
  try {
  const { status, data } = await proxyTtsSynthesis(req.body)
    if (status === 403 && data?.error?.message?.includes('referer')) {
      data.hint =
        'GOOGLE_TTS_API_KEY en Render debe ser una key SOLO servidor: Application restrictions = None, API restrictions = Cloud Text-to-Speech API. No uses restricción HTTP referrer en esa key.'
    }
    res.status(status).json(data)
  } catch (err) {
    res.status(502).json({ error: String(err) })
  }
}

export function createTtsProxyMiddleware() {
  return (req, res, next) => {
    if (req.method !== 'POST') {
      res.statusCode = 405
      res.end()
      return
    }

    const chunks = []
    req.on('data', (chunk) => chunks.push(chunk))
    req.on('error', next)
    req.on('end', async () => {
      try {
        const body = JSON.parse(Buffer.concat(chunks).toString('utf8') || '{}')
        const { status, data } = await proxyTtsSynthesis(body)
        res.statusCode = status
        res.setHeader('Content-Type', 'application/json')
        res.end(JSON.stringify(data))
      } catch (err) {
        res.statusCode = 502
        res.setHeader('Content-Type', 'application/json')
        res.end(JSON.stringify({ error: String(err) }))
      }
    })
  }
}
