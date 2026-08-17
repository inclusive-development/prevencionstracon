import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import { DEFAULT_LOCALE, getLocale, LOCALES } from './locales'
import { translate } from './messages'
import { tts } from '../voice/tts'

const LocaleContext = createContext({
  locale: DEFAULT_LOCALE,
  localeMeta: getLocale(DEFAULT_LOCALE),
  setLocale: () => {},
  t: (key, vars) => translate(DEFAULT_LOCALE, key, vars),
  enabled: false,
  locales: LOCALES,
})

export function LocaleProvider({
  enabled = false,
  allowedLocales = null,
  children,
}) {
  const [locale, setLocaleState] = useState(DEFAULT_LOCALE)

  const locales = useMemo(() => {
    if (!allowedLocales?.length) return LOCALES
    const set = new Set(allowedLocales)
    return LOCALES.filter((l) => set.has(l.id))
  }, [allowedLocales])

  useEffect(() => {
    if (!enabled && locale !== DEFAULT_LOCALE) {
      setLocaleState(DEFAULT_LOCALE)
      return
    }
    if (enabled && allowedLocales?.length && !allowedLocales.includes(locale)) {
      setLocaleState(DEFAULT_LOCALE)
    }
  }, [enabled, locale, allowedLocales])

  const setLocale = useCallback(
    (id) => {
      if (!locales.some((l) => l.id === id)) return
      tts.cancel()
      tts.setLocale(id)
      setLocaleState(id)
    },
    [locales],
  )

  useEffect(() => {
    tts.setLocale(enabled ? locale : DEFAULT_LOCALE)
  }, [locale, enabled])

  const t = useCallback(
    (key, vars) => translate(enabled ? locale : DEFAULT_LOCALE, key, vars),
    [locale, enabled],
  )

  const value = useMemo(
    () => ({
      locale: enabled ? locale : DEFAULT_LOCALE,
      localeMeta: getLocale(enabled ? locale : DEFAULT_LOCALE),
      setLocale,
      t,
      enabled,
      locales,
    }),
    [locale, setLocale, t, enabled, locales],
  )

  return <LocaleContext.Provider value={value}>{children}</LocaleContext.Provider>
}

export function useLocale() {
  return useContext(LocaleContext)
}
