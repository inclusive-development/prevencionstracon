/** Nombres de países por locale (id de PAISES). Ciudades clave opcionales. */

const COUNTRY = {
  cl: { es: 'Chile', en: 'Chile', ko: '칠레', zh: '智利', ja: 'チリ', pt: 'Chile', fr: 'Chili' },
  ar: { es: 'Argentina', en: 'Argentina', ko: '아르헨티나', zh: '阿根廷', ja: 'アルゼンチン', pt: 'Argentina', fr: 'Argentine' },
  pe: { es: 'Perú', en: 'Peru', ko: '페루', zh: '秘鲁', ja: 'ペルー', pt: 'Peru', fr: 'Pérou' },
  co: { es: 'Colombia', en: 'Colombia', ko: '콜롬비아', zh: '哥伦比亚', ja: 'コロンビア', pt: 'Colômbia', fr: 'Colombie' },
  br: { es: 'Brasil', en: 'Brazil', ko: '브라질', zh: '巴西', ja: 'ブラジル', pt: 'Brasil', fr: 'Brésil' },
  mx: { es: 'México', en: 'Mexico', ko: '멕시코', zh: '墨西哥', ja: 'メキシコ', pt: 'México', fr: 'Mexique' },
  us: { es: 'Estados Unidos', en: 'United States', ko: '미국', zh: '美国', ja: 'アメリカ', pt: 'Estados Unidos', fr: 'États-Unis' },
  ca: { es: 'Canadá', en: 'Canada', ko: '캐나다', zh: '加拿大', ja: 'カナダ', pt: 'Canadá', fr: 'Canada' },
  es: { es: 'España', en: 'Spain', ko: '스페인', zh: '西班牙', ja: 'スペイン', pt: 'Espanha', fr: 'Espagne' },
  fr: { es: 'Francia', en: 'France', ko: '프랑스', zh: '法国', ja: 'フランス', pt: 'França', fr: 'France' },
  gb: { es: 'Reino Unido', en: 'United Kingdom', ko: '영국', zh: '英国', ja: 'イギリス', pt: 'Reino Unido', fr: 'Royaume-Uni' },
  de: { es: 'Alemania', en: 'Germany', ko: '독일', zh: '德国', ja: 'ドイツ', pt: 'Alemanha', fr: 'Allemagne' },
  it: { es: 'Italia', en: 'Italy', ko: '이탈리아', zh: '意大利', ja: 'イタリア', pt: 'Itália', fr: 'Italie' },
  pt: { es: 'Portugal', en: 'Portugal', ko: '포르투갈', zh: '葡萄牙', ja: 'ポルトガル', pt: 'Portugal', fr: 'Portugal' },
  jp: { es: 'Japón', en: 'Japan', ko: '일본', zh: '日本', ja: '日本', pt: 'Japão', fr: 'Japon' },
  kr: { es: 'Corea del Sur', en: 'South Korea', ko: '대한민국', zh: '韩国', ja: '韓国', pt: 'Coreia do Sul', fr: 'Corée du Sud' },
  cn: { es: 'China', en: 'China', ko: '중국', zh: '中国', ja: '中国', pt: 'China', fr: 'Chine' },
  in: { es: 'India', en: 'India', ko: '인도', zh: '印度', ja: 'インド', pt: 'Índia', fr: 'Inde' },
  ae: { es: 'Emiratos Árabes', en: 'United Arab Emirates', ko: '아랍에미리트', zh: '阿联酋', ja: 'アラブ首長国連邦', pt: 'Emirados Árabes', fr: 'Émirats arabes' },
  au: { es: 'Australia', en: 'Australia', ko: '호주', zh: '澳大利亚', ja: 'オーストラリア', pt: 'Austrália', fr: 'Australie' },
  nz: { es: 'Nueva Zelanda', en: 'New Zealand', ko: '뉴질랜드', zh: '新西兰', ja: 'ニュージーランド', pt: 'Nova Zelândia', fr: 'Nouvelle-Zélande' },
  za: { es: 'Sudáfrica', en: 'South Africa', ko: '남아프리카', zh: '南非', ja: '南アフリカ', pt: 'África do Sul', fr: 'Afrique du Sud' },
  ec: { es: 'Ecuador', en: 'Ecuador', ko: '에콰도르', zh: '厄瓜多尔', ja: 'エクアドル', pt: 'Equador', fr: 'Équateur' },
  uy: { es: 'Uruguay', en: 'Uruguay', ko: '우루과이', zh: '乌拉圭', ja: 'ウルグアイ', pt: 'Uruguai', fr: 'Uruguay' },
  pa: { es: 'Panamá', en: 'Panama', ko: '파나마', zh: '巴拿马', ja: 'パナマ', pt: 'Panamá', fr: 'Panama' },
  cr: { es: 'Costa Rica', en: 'Costa Rica', ko: '코스타리카', zh: '哥斯达黎加', ja: 'コスタリカ', pt: 'Costa Rica', fr: 'Costa Rica' },
}

const CITY = {
  'cl-scl': { es: 'Santiago', en: 'Santiago', ko: '산티아고', zh: '圣地亚哥', ja: 'サンティアゴ', pt: 'Santiago', fr: 'Santiago' },
  'ar-eze': { es: 'Buenos Aires', en: 'Buenos Aires', ko: '부에노스아이레스', zh: '布宜诺斯艾利斯', ja: 'ブエノスアイレス', pt: 'Buenos Aires', fr: 'Buenos Aires' },
  'pe-lim': { es: 'Lima', en: 'Lima', ko: '리마', zh: '利马', ja: 'リマ', pt: 'Lima', fr: 'Lima' },
  'br-gru': { es: 'São Paulo', en: 'São Paulo', ko: '상파울루', zh: '圣保罗', ja: 'サンパウロ', pt: 'São Paulo', fr: 'São Paulo' },
  'br-gig': { es: 'Río de Janeiro', en: 'Rio de Janeiro', ko: '리우데자네이루', zh: '里约热内卢', ja: 'リオデジャネイロ', pt: 'Rio de Janeiro', fr: 'Rio de Janeiro' },
  'mx-mex': { es: 'Ciudad de México', en: 'Mexico City', ko: '멕시코시티', zh: '墨西哥城', ja: 'メキシコシティ', pt: 'Cidade do México', fr: 'Mexico' },
  'us-jfk': { es: 'Nueva York', en: 'New York', ko: '뉴욕', zh: '纽约', ja: 'ニューヨーク', pt: 'Nova York', fr: 'New York' },
  'us-mia': { es: 'Miami', en: 'Miami', ko: '마이애미', zh: '迈阿密', ja: 'マイアミ', pt: 'Miami', fr: 'Miami' },
  'us-lax': { es: 'Los Ángeles', en: 'Los Angeles', ko: '로스앤젤레스', zh: '洛杉矶', ja: 'ロサンゼルス', pt: 'Los Angeles', fr: 'Los Angeles' },
  'es-mad': { es: 'Madrid', en: 'Madrid', ko: '마드리드', zh: '马德里', ja: 'マドリード', pt: 'Madri', fr: 'Madrid' },
  'fr-cdg': { es: 'París', en: 'Paris', ko: '파리', zh: '巴黎', ja: 'パリ', pt: 'Paris', fr: 'Paris' },
  'gb-lhr': { es: 'Londres', en: 'London', ko: '런던', zh: '伦敦', ja: 'ロンドン', pt: 'Londres', fr: 'Londres' },
  'jp-nrt': { es: 'Tokio', en: 'Tokyo', ko: '도쿄', zh: '东京', ja: '東京', pt: 'Tóquio', fr: 'Tokyo' },
  'kr-icn': { es: 'Seúl', en: 'Seoul', ko: '서울', zh: '首尔', ja: 'ソウル', pt: 'Seul', fr: 'Séoul' },
  'cn-pek': { es: 'Pekín', en: 'Beijing', ko: '베이징', zh: '北京', ja: '北京', pt: 'Pequim', fr: 'Pékin' },
  'cn-pvg': { es: 'Shanghái', en: 'Shanghai', ko: '상하이', zh: '上海', ja: '上海', pt: 'Xangai', fr: 'Shanghai' },
}

export function countryName(locale, paisId, fallback = '') {
  return COUNTRY[paisId]?.[locale] || COUNTRY[paisId]?.es || fallback
}

export function cityName(locale, destinoId, fallback = '') {
  return CITY[destinoId]?.[locale] || CITY[destinoId]?.es || fallback
}

export function localizePais(pais, locale) {
  if (!pais) return pais
  return {
    ...pais,
    nombre: countryName(locale, pais.id, pais.nombre),
    destinos: (pais.destinos || []).map((d) => ({
      ...d,
      ciudad: cityName(locale, d.id, d.ciudad),
    })),
  }
}

export function localizeDestino(destino, locale) {
  if (!destino) return destino
  return {
    ...destino,
    ciudad: cityName(locale, destino.id, destino.ciudad),
    pais: countryName(locale, destino.id?.split('-')[0], destino.pais),
  }
}
