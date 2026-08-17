import { voiceIncludes } from '../utils/voiceParse'

/** Palabras clave de voz multi-idioma (reconocimiento flexible). */

export const VC = {
  continue: [
    'continuar', 'siguiente', 'buscar', 'continue', 'next', 'search',
    '계속', '다음', '검색', '继续', '下一步', '搜索', '続行', '次へ', '検索',
    'continuar', 'seguir', 'próximo', 'proximo', 'continuer', 'suivant', 'chercher',
  ],
  confirm: [
    'confirmar', 'reservar', 'finalizar', 'confirm', 'book', 'finish',
    '확인', '예약', '완료', '确认', '预订', '完成', '確認', '予約', '完了',
    'confirmar', 'reservar', 'finalizar', 'confirmer', 'réserver', 'reserver',
  ],
  roundTrip: [
    'ida y vuelta', 'round trip', 'roundtrip', 'return trip',
    '왕복', '往返', '往復', 'ida e volta', 'aller-retour', 'aller retour',
  ],
  oneWay: [
    'solo ida', 'una ida', 'one way', 'oneway', 'single',
    '편도', '单程', '片道', 'só ida', 'so ida', 'aller simple',
  ],
  bookFlight: [
    'reservar', 'nuevo', 'comprar', 'book', 'reserve', 'new',
    '예약', '预订', '予約', 'reservar', 'comprar', 'réserver', 'reserver',
  ],
  back: [
    'volver', 'menu', 'atras', 'atrás', 'back', 'return', 'home',
    '뒤로', '메뉴', '返回', '菜单', '戻る', 'メニュー', 'voltar', 'voltar', 'retour', 'menu',
  ],
  /** Opción principal / reservar (todos los temas) */
  welcomeBook: [
    'reservar', 'reserva', 'reservar vuelo', 'reservar un vuelo', 'quiero reservar',
    'pedir hora', 'agendar', 'sacar hora', 'cargar', 'combustible', 'cargar combustible',
    'book', 'book a flight', 'reserve a flight', 'flight booking',
    'réserver', 'reserver', 'réserver un vol', 'prendre rendez-vous',
    'reservar voo', 'quero reservar', 'agendar horario',
    '예약', '항공편 예약', '예약하기',
    '预订', '预订航班', '预约',
    '予約', 'フライト予約', '予約する',
  ],
  /** Opción secundaria / consultar */
  welcomeConsult: [
    'consultar', 'mis vuelos', 'ver mis vuelos', 'mis horas', 'ver mis horas',
    'mis cargas', 'mis citas', 'ver mis', 'mis reservas',
    'my flights', 'see my flights', 'my bookings', 'my appointments',
    'mes vols', 'voir mes vols', 'mes rendez-vous',
    'meus voos', 'ver meus voos', 'minhas horas',
    '내 항공편', '내 예약', '내 시간',
    '我的航班', '查看航班', '我的预约',
    'マイフライト', '予約確認', '自分の予約',
  ],
}

export function voiceWantsBook(text, extraLabels = []) {
  return voiceIncludes(text, ...VC.welcomeBook, ...extraLabels.filter(Boolean))
}

export function voiceWantsConsult(text, extraLabels = []) {
  return voiceIncludes(text, ...VC.welcomeConsult, ...extraLabels.filter(Boolean))
}
