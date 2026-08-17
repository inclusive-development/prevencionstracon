import { useEffect, useRef, useState } from 'react'
import { avatar } from '../avatar/controller'
import { tts } from '../voice/tts'

const FIT = {
  welcome: { scaleMul: 1.55, anchorY: 0.04, yMul: -0.02 },
  rut: { scaleMul: 1.0, anchorY: 0.11, yMul: 0.04 },
  panel: { scaleMul: 0.9, anchorY: 0.12, yMul: 0.05 },
  map: { scaleMul: 0.95, anchorY: 0.04, yMul: 0.08 },
}

export default function AvatarStage({
  caption,
  modelUrl = '/models/haru/haru_greeter_t03.model3.json',
  fitMode = 'welcome',
  onReady,
}) {
  const hostRef = useRef(null)
  const [status, setStatus] = useState('cargando')
  const fitModeRef = useRef(fitMode)
  const fitRef = useRef(null)
  const readyRef = useRef(onReady)
  const modelRef = useRef(null)

  readyRef.current = onReady
  fitModeRef.current = fitMode

  useEffect(() => {
    if (status === 'listo' || status === 'error') {
      readyRef.current?.()
    }
  }, [status])

  useEffect(() => {
    fitRef.current?.()
  }, [fitMode])

  useEffect(() => {
    const host = hostRef.current
    if (!host) return

    let app = null
    let model = null
    let disposed = false
    let resizeObs = null
    let lastTapAt = 0
    let handle = null

    const waitForSize = () =>
      new Promise((resolve) => {
        const ready = () => host.clientWidth > 0 && host.clientHeight > 0
        if (ready()) {
          resolve()
          return
        }
        const obs = new ResizeObserver(() => {
          if (ready()) {
            obs.disconnect()
            resolve()
          }
        })
        obs.observe(host)
        setTimeout(() => {
          obs.disconnect()
          resolve()
        }, 2000)
      })

    ;(async () => {
      try {
        setStatus('cargando')
        await waitForSize()
        if (disposed) return

        const PIXI = await import('pixi.js')
        window.PIXI = PIXI
        const { Live2DModel } = await import('pixi-live2d-display/cubism4')
        if (disposed) return

        const width = Math.max(host.clientWidth, 1)
        const height = Math.max(host.clientHeight, 1)

        app = new PIXI.Application({
          width,
          height,
          backgroundAlpha: 0,
          antialias: true,
          autoDensity: true,
          resolution: Math.min(window.devicePixelRatio || 1, 2),
          powerPreference: 'high-performance',
        })

        const view = app.view
        view.className = 'avatar-canvas'
        view.style.cssText =
          'position:absolute;inset:0;width:100%;height:100%;display:block;touch-action:manipulation;cursor:pointer;'
        host.appendChild(view)

        model = await Live2DModel.from(modelUrl, {
          motionPreload: 'IDLE',
          autoInteract: false,
        })
        if (disposed) {
          model.destroy()
          return
        }

        app.stage.addChild(model)
        modelRef.current = model

        model.interactive = true
        model.buttonMode = true
        model.cursor = 'pointer'

        const reaccionar = () => {
          const now = Date.now()
          if (now - lastTapAt < 700) return
          lastTapAt = now
          // Gesto suave + sonrisa (Tap se veía serio/enojo).
          model.motion('Idle', 1)
          try {
            model.expression('f04')
          } catch {
            /* ok */
          }
        }

        model.on('hit', reaccionar)
        model.on('pointertap', reaccionar)

        handle = {
          playMotion(group, index) {
            if (disposed || !modelRef.current) return
            try {
              if (typeof index === 'number') modelRef.current.motion(group, index)
              else modelRef.current.motion(group)
            } catch (err) {
              console.warn('[Avatar] motion', group, index, err)
            }
          },
          playExpression(name) {
            if (disposed || !modelRef.current) return
            try {
              modelRef.current.expression(name)
            } catch {
              /* ok */
            }
          },
        }
        avatar.register(handle)
        // Sonrisa por defecto apenas carga el modelo.
        try {
          handle.playExpression('f04')
          handle.playMotion('Idle', 1)
        } catch {
          /* ok */
        }

        const fit = () => {
          if (!app || !model || disposed) return
          const w = app.renderer.width / app.renderer.resolution
          const h = app.renderer.height / app.renderer.resolution
          const ow = model.internalModel.originalWidth || model.width
          const mode = FIT[fitModeRef.current] || FIT.welcome
          const scale = (w / ow) * mode.scaleMul
          model.scale.set(scale)
          model.anchor.set(0.5, mode.anchorY)
          model.position.set(w / 2, h * mode.yMul)
        }
        fitRef.current = fit
        fit()

        resizeObs = new ResizeObserver(() => {
          if (!app || disposed) return
          app.renderer.resize(Math.max(host.clientWidth, 1), Math.max(host.clientHeight, 1))
          fit()
        })
        resizeObs.observe(host)

        const core = model.internalModel.coreModel
        model.internalModel.on('beforeModelUpdate', () => {
          core.setParameterValueById('ParamMouthOpenY', tts.mouth)
          // Sin rubor/sonrojo en ningún gesto ni expresión residual.
          core.setParameterValueById('ParamTere', 0)
        })

        if (!disposed) setStatus('listo')
      } catch (err) {
        console.error('[Avatar] Error cargando Live2D:', err)
        if (!disposed) setStatus('error')
      }
    })()

    return () => {
      fitRef.current = null
      modelRef.current = null
      if (handle) avatar.unregister(handle)
      disposed = true
      try {
        resizeObs?.disconnect()
        model?.destroy()
        if (app) {
          const view = app.view
          app.destroy(true, { children: true, texture: true, baseTexture: true })
          if (view?.parentNode) view.parentNode.removeChild(view)
        }
      } catch {
        /* ok */
      }
    }
  }, [modelUrl])

  const stageClass =
    fitMode === 'map'
      ? 'avatar-stage avatar-stage--compact'
      : fitMode === 'panel'
        ? 'avatar-stage avatar-stage--panel'
        : fitMode === 'rut'
          ? 'avatar-stage avatar-stage--rut'
          : 'avatar-stage'

  return (
    <div className={stageClass} ref={hostRef}>
      <div className="avatar-glow" aria-hidden="true" />
      {status === 'cargando' && (
        <div className="avatar-loading">
          <span className="spinner" aria-hidden="true" />
          Cargando asistente…
        </div>
      )}
      {status === 'error' && (
        <div className="avatar-loading">No se pudo cargar el avatar</div>
      )}
      {caption && (
        <div className="avatar-caption" role="status">
          {caption}
        </div>
      )}
    </div>
  )
}
