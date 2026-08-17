import { useCallback, useEffect, useRef, useState } from 'react'
import AvatarStage from '@shared/components/AvatarStage'
import ScreenTransition from '@shared/components/ScreenTransition'
import Stepper from '@shared/components/Stepper'
import EppSplash from './components/EppSplash'
import StraconLogo from './components/StraconLogo'
import { TENANT, isEmpresaRutAllowed } from './data/tenants'
import { avatar } from '@shared/avatar/controller'
import { tts } from '@shared/voice/tts'
import AcreditacionScreen from './screens/AcreditacionScreen'
import EppFlow from './screens/EppFlow'
import PrevencionRutScreen from './screens/PrevencionRutScreen'

const AVATAR_MODEL = '/models/haru/haru_greeter_t03.clinica.model3.json'
const PASOS = ['Identificación', 'Acreditación', 'EPP', 'Acceso']
const INACTIVIDAD_MS = 120000
const SPLASH_MIN_MS = 550
const SPLASH_FADE_MS = 420
const WELCOME_MSG = TENANT.welcomeMsg

export default function App() {
  const [screen, setScreen] = useState('home')
  const [navDirection, setNavDirection] = useState('forward')
  const [rutEmpresa, setRutEmpresa] = useState('')
  const [rutTrabajador, setRutTrabajador] = useState('')
  const [trabajador, setTrabajador] = useState(null)
  const [caption, setCaption] = useState(null)
  const [welcomeVisible, setWelcomeVisible] = useState(false)
  const [showSplash, setShowSplash] = useState(true)
  const [splashPhase, setSplashPhase] = useState('in')
  const [avatarReady, setAvatarReady] = useState(false)
  const [eppPhase, setEppPhase] = useState('intro')
  const [acrPhase, setAcrPhase] = useState('checking')
  const [flowKey, setFlowKey] = useState(0)
  const splashTimer = useRef(null)
  const welcomeHeardRef = useRef(false)
  const screenRef = useRef(screen)
  const showSplashRef = useRef(showSplash)

  useEffect(() => {
    screenRef.current = screen
  }, [screen])

  useEffect(() => {
    showSplashRef.current = showSplash
  }, [showSplash])

  const playWelcome = useCallback((softStart = true) => {
    if (welcomeHeardRef.current || tts.speaking || tts.hasPending()) return Promise.resolve()
    return tts.speak(WELCOME_MSG, { softStart }).catch(() => {})
  }, [])

  useEffect(() => {
    tts.onCaption = setCaption
    // Cualquier toque desbloquea audio y dispara el saludo pendiente (Chrome).
    const unlock = () => {
      const needsWelcome =
        screenRef.current === 'home' &&
        !showSplashRef.current &&
        !welcomeHeardRef.current
      tts.unlock()
      if (needsWelcome && !tts.speaking && !tts.hasPending()) {
        void playWelcome(true)
      }
    }
    window.addEventListener('pointerdown', unlock, { capture: true, passive: true })
    return () => {
      tts.onCaption = null
      tts.cancel()
      window.removeEventListener('pointerdown', unlock, { capture: true })
    }
  }, [playWelcome])

  useEffect(() => {
    if (!avatarReady) return
    void tts.prefetch(WELCOME_MSG).finally(() => tts.tryAutoUnlock())
  }, [avatarReady])

  const handleAvatarReady = useCallback(() => {
    setAvatarReady(true)
  }, [])

  useEffect(() => {
    if (!showSplash || !avatarReady) return
    splashTimer.current = setTimeout(() => {
      setSplashPhase('out')
      splashTimer.current = setTimeout(() => setShowSplash(false), SPLASH_FADE_MS)
    }, SPLASH_MIN_MS)
    return () => clearTimeout(splashTimer.current)
  }, [showSplash, avatarReady])

  useEffect(() => {
    if (showSplash || !avatarReady || screen !== 'home') {
      setWelcomeVisible(false)
      return
    }

    setWelcomeVisible(true)
    avatar.content()

    if (welcomeHeardRef.current) {
      return undefined
    }

    let cancelled = false

    const unsubPlayback = tts.onPlaybackStart(() => {
      // Solo marcar escuchado cuando el audio arranca de verdad (no en silencio).
      welcomeHeardRef.current = true
      if (!cancelled) avatar.greet()
    })

    void playWelcome(true)

    // Reintentos: Google a veces queda bloqueado por autoplay; browser TTS o
    // un unlock posterior pueden destrabarlo.
    const retryTimers = [400, 1200, 2500].map((ms) =>
      window.setTimeout(() => {
        if (cancelled || welcomeHeardRef.current) return
        tts.tryAutoUnlock()
        void playWelcome(true)
      }, ms),
    )

    return () => {
      cancelled = true
      retryTimers.forEach(clearTimeout)
      unsubPlayback()
    }
  }, [showSplash, avatarReady, screen, playWelcome])

  const goTo = useCallback((next, direction = 'forward') => {
    setNavDirection(direction)
    setScreen(next)
  }, [])

  const reset = useCallback(() => {
    tts.cancel()
    welcomeHeardRef.current = false
    setRutEmpresa('')
    setRutTrabajador('')
    setTrabajador(null)
    setEppPhase('intro')
    setAcrPhase('checking')
    setFlowKey((k) => k + 1)
    goTo('home', 'back')
  }, [goTo])

  const iniciarIngreso = () => {
    // Desbloquear audio del gesto, cortar saludo y seguir con TTS del flujo.
    tts.unlock()
    tts.cancel()
    setRutEmpresa('')
    setRutTrabajador('')
    setTrabajador(null)
    setWelcomeVisible(false)
    setFlowKey((k) => k + 1)
    goTo('rut-empresa', 'from-welcome')
  }

  const empresaValidada = (r) => {
    if (!isEmpresaRutAllowed(r)) return
    setRutEmpresa(r)
    goTo('rut-trabajador', 'forward')
  }

  const trabajadorValidado = (r) => {
    setRutTrabajador(r)
    setAcrPhase('checking')
    goTo('acreditacion', 'forward')
  }

  const acreditacionOk = (t) => {
    setTrabajador(t)
    setEppPhase('intro')
    goTo('epp', 'forward')
  }

  const idleTimer = useRef(null)
  useEffect(() => {
    const arm = () => {
      clearTimeout(idleTimer.current)
      idleTimer.current = setTimeout(() => {
        if (screen !== 'home') reset()
        else {
          welcomeHeardRef.current = false
          tts.cancel()
          setWelcomeVisible(true)
          void playWelcome(true)
        }
      }, INACTIVIDAD_MS)
    }
    arm()
    window.addEventListener('pointerdown', arm)
    return () => {
      clearTimeout(idleTimer.current)
      window.removeEventListener('pointerdown', arm)
    }
  }, [screen, reset, playWelcome])

  const welcomeMode = screen === 'home'
  const eppScanMode = screen === 'epp' && eppPhase === 'scan'
  const hideNav =
    (screen === 'acreditacion' && acrPhase === 'result') || screen === 'epp'
  const rutScreens = screen === 'rut-empresa' || screen === 'rut-trabajador'
  const compactAvatar =
    rutScreens ||
    screen === 'acreditacion' ||
    (screen === 'epp' && eppPhase !== 'scan')

  const paso =
    screen === 'home' || rutScreens
      ? 0
      : screen === 'acreditacion'
        ? 1
        : screen === 'epp' && eppPhase === 'result'
          ? 3
          : screen === 'epp'
            ? 2
            : 0

  const avatarFit = eppScanMode ? 'map' : welcomeMode ? 'welcome' : compactAvatar ? 'rut' : 'panel'

  const renderPanel = () => {
    if (screen === 'rut-empresa') {
      return (
        <PrevencionRutScreen
          key={`empresa-${flowKey}`}
          variant="empresa"
          allowedRuts={TENANT.empresaRuts}
          onValid={empresaValidada}
          onBack={reset}
        />
      )
    }
    if (screen === 'rut-trabajador') {
      return (
        <PrevencionRutScreen
          key={`trabajador-${flowKey}`}
          variant="trabajador"
          onValid={trabajadorValidado}
          onBack={reset}
        />
      )
    }
    if (screen === 'acreditacion') {
      return (
        <AcreditacionScreen
          key={`acr-${flowKey}-${rutTrabajador}`}
          rutEmpresa={rutEmpresa}
          rutTrabajador={rutTrabajador}
          onAprobado={acreditacionOk}
          onRechazado={reset}
          onBack={reset}
          onPhaseChange={setAcrPhase}
        />
      )
    }
    if (screen === 'epp' && trabajador) {
      return (
        <EppFlow
          key={`epp-${flowKey}`}
          trabajador={trabajador}
          rutEmpresa={rutEmpresa}
          onFinish={reset}
          onRejected={reset}
          onBack={reset}
          onPhaseChange={setEppPhase}
        />
      )
    }
    return null
  }

  return (
    <div
      className={`totem totem-prevencion totem-stracon ${welcomeMode ? 'totem-welcome-mode' : ''} ${compactAvatar && !eppScanMode ? 'totem-rut-mode' : ''} ${eppScanMode ? 'totem-epp-scan-mode' : ''} ${hideNav ? 'totem-nav-hidden' : ''}`}
      data-tema="epp"
    >
      {showSplash && <EppSplash phase={splashPhase} />}

      {!hideNav && (
        <header className="totem-header totem-header--epp">
          <div className="brand brand-stracon">
            <StraconLogo className="brand-logo-stracon" alt="Stracon" />
          </div>
          <Stepper paso={welcomeMode ? 0 : paso} pasos={PASOS} />
        </header>
      )}

      {!eppScanMode && (
        <div className="avatar-wrap">
          <AvatarStage
            caption={welcomeMode ? null : caption}
            modelUrl={AVATAR_MODEL}
            fitMode={avatarFit}
            onReady={handleAvatarReady}
          />
          {welcomeMode && !showSplash && welcomeVisible && (
            <div className="epp-welcome-overlay">
              <button type="button" className="floating-action-btn epp-start-btn" onClick={iniciarIngreso}>
                <span className="floating-action-icon" aria-hidden="true">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M12 3v12M8 11l4 4 4-4" strokeLinecap="round" strokeLinejoin="round" />
                    <path d="M4 21h16" strokeLinecap="round" />
                  </svg>
                </span>
                <span className="floating-action-text">
                  <span className="floating-action-label">Ingresar a faena</span>
                  <span className="floating-action-sub">Empresa, trabajador, acreditación y EPP</span>
                </span>
              </button>
            </div>
          )}
        </div>
      )}

      <main className={`totem-panel ${welcomeMode ? 'totem-panel--hidden' : ''}`}>
        {!showSplash && screen !== 'home' && (
          <ScreenTransition
            direction={navDirection === 'from-welcome' ? 'from-welcome' : navDirection}
            screenKey={`${screen}-${flowKey}`}
          >
            {renderPanel()}
          </ScreenTransition>
        )}
      </main>
    </div>
  )
}
