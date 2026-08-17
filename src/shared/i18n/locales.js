/** Locales del tótem LATAM (solo aeropuerto). */

export const LOCALES = [
  {
    id: 'es',
    label: 'ES',
    flag: 'es',
    name: 'Español',
    intl: 'es-CL',
    speech: 'es-CL',
    google: { languageCode: 'es-US', name: 'es-US-Neural2-A', ssmlGender: 'FEMALE' },
    browserLangPrefix: 'es',
  },
  {
    id: 'en',
    label: 'US',
    flag: 'us',
    name: 'English',
    intl: 'en-US',
    speech: 'en-US',
    google: { languageCode: 'en-US', name: 'en-US-Neural2-F', ssmlGender: 'FEMALE' },
    browserLangPrefix: 'en',
  },
  {
    id: 'ko',
    label: 'KR',
    flag: 'kr',
    name: '한국어',
    intl: 'ko-KR',
    speech: 'ko-KR',
    google: { languageCode: 'ko-KR', name: 'ko-KR-Neural2-A', ssmlGender: 'FEMALE' },
    browserLangPrefix: 'ko',
  },
  {
    id: 'zh',
    label: '中文',
    flag: 'cn',
    name: '中文',
    intl: 'zh-CN',
    speech: 'zh-CN',
    google: { languageCode: 'cmn-CN', name: 'cmn-CN-Wavenet-A', ssmlGender: 'FEMALE' },
    browserLangPrefix: 'zh',
  },
  {
    id: 'ja',
    label: 'JP',
    flag: 'jp',
    name: '日本語',
    intl: 'ja-JP',
    speech: 'ja-JP',
    google: { languageCode: 'ja-JP', name: 'ja-JP-Neural2-B', ssmlGender: 'FEMALE' },
    browserLangPrefix: 'ja',
  },
  {
    id: 'pt',
    label: 'PT',
    flag: 'pt',
    name: 'Português',
    intl: 'pt-BR',
    speech: 'pt-BR',
    google: { languageCode: 'pt-BR', name: 'pt-BR-Neural2-A', ssmlGender: 'FEMALE' },
    browserLangPrefix: 'pt',
  },
  {
    id: 'fr',
    label: 'FR',
    flag: 'fr',
    name: 'Français',
    intl: 'fr-FR',
    speech: 'fr-FR',
    google: { languageCode: 'fr-FR', name: 'fr-FR-Neural2-A', ssmlGender: 'FEMALE' },
    browserLangPrefix: 'fr',
  },
]

export const DEFAULT_LOCALE = 'es'

export function getLocale(id) {
  return LOCALES.find((l) => l.id === id) || LOCALES[0]
}
