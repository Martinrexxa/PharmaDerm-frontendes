/**
 * currency.js — Conversión y formateo de precios para toda la app.
 *
 * Uso:
 *   import { convertPrice, formatPrice, priceIn } from '@/utils/currency'
 *   priceIn(1850, 'DOP', 'USD')  →  "US$31.15"
 */

export { countryList, countryCurrencyMap } from '../data/countries.js'

/** Tasas de cambio (base: 1 USD = X moneda) */
export const exchangeRates = {
  USD: 1,
  DOP: Number(import.meta.env.VITE_DOP_EXCHANGE_RATE) || 59.40,
  EUR: 0.92,
  GBP: 0.79,
  CHF: 0.89,
  MXN: 17.15,
  COP: 3950,
  ARS: 870,
  CLP: 920,
  PEN: 3.72,
  BRL: 4.97,
  CAD: 1.36,
  JPY: 149.5,
  // Asia
  CNY: 7.24,
  KRW: 1330,
  INR: 83.5,
  AUD: 1.53,
  NZD: 1.63,
  SGD: 1.34,
  HKD: 7.82,
  TWD: 31.8,
  THB: 35.5,
  MYR: 4.72,
  IDR: 15700,
  PHP: 56.5,
  VND: 24500,
  // Oriente Medio
  AED: 3.67,
  SAR: 3.75,
  QAR: 3.64,
  KWD: 0.31,
  ILS: 3.74,
  TRY: 32.5,
  // África
  ZAR: 18.7,
  NGN: 1600,
  KES: 135,
  EGP: 49,
  MAD: 10.1,
  DZD: 135,
  // Europa no euro
  SEK: 10.5,
  NOK: 10.6,
  DKK: 6.88,
  PLN: 3.98,
  CZK: 22.8,
  HUF: 360,
  RON: 4.58,
}

/** Símbolos por moneda */
export const currencySymbols = {
  USD: 'US$', DOP: 'RD$', EUR: '€',  GBP: '£',  CHF: 'CHF',
  MXN: '$',   COP: '$',   ARS: '$',  CLP: '$',  PEN: 'S/',
  BRL: 'R$',  CAD: 'CA$', JPY: '¥',
  CNY: '¥',   KRW: '₩',  INR: '₹', AUD: 'A$', NZD: 'NZ$',
  SGD: 'S$',  HKD: 'HK$', TWD: 'NT$', THB: '฿', MYR: 'RM',
  IDR: 'Rp',  PHP: '₱',  VND: '₫',
  AED: 'د.إ', SAR: '﷼', QAR: 'QR', KWD: 'KD', ILS: '₪', TRY: '₺',
  ZAR: 'R',   NGN: '₦',  KES: 'KSh', EGP: 'E£', MAD: 'د.م.',
  DZD: 'دج',  SEK: 'kr', NOK: 'kr', DKK: 'kr', PLN: 'zł',
  CZK: 'Kč',  HUF: 'Ft', RON: 'lei',
}

/** Locale para Intl.NumberFormat */
const currencyLocale = {
  USD: 'en-US', DOP: 'es-DO', EUR: 'de-DE', GBP: 'en-GB', CHF: 'de-CH',
  MXN: 'es-MX', COP: 'es-CO', ARS: 'es-AR', CLP: 'es-CL', PEN: 'es-PE',
  BRL: 'pt-BR', CAD: 'en-CA', JPY: 'ja-JP',
  CNY: 'zh-CN', KRW: 'ko-KR', INR: 'hi-IN', AUD: 'en-AU', NZD: 'en-NZ',
  SGD: 'en-SG', HKD: 'zh-HK', TWD: 'zh-TW', THB: 'th-TH', MYR: 'ms-MY',
  IDR: 'id-ID', PHP: 'fil-PH', VND: 'vi-VN',
  AED: 'ar-AE', SAR: 'ar-SA', ILS: 'he-IL', TRY: 'tr-TR',
  ZAR: 'en-ZA', NGN: 'en-NG', EGP: 'ar-EG',
  SEK: 'sv-SE', NOK: 'nb-NO', DKK: 'da-DK', PLN: 'pl-PL',
  CZK: 'cs-CZ', HUF: 'hu-HU', RON: 'ro-RO',
}

/** Monedas sin decimales */
const NO_DECIMALS = new Set(['JPY', 'KRW', 'VND', 'IDR', 'CLP', 'ARS', 'COP', 'HUF', 'NGN', 'DZD'])

/**
 * Convierte un monto de una moneda a otra.
 * @param {number} amount
 * @param {string} fromCurrency  Moneda origen (ej: 'DOP')
 * @param {string} toCurrency    Moneda destino (ej: 'USD')
 * @returns {number}
 */
export function convertPrice(amount, fromCurrency = 'DOP', toCurrency = 'DOP') {
  if (!amount || fromCurrency === toCurrency) return Number(amount) || 0
  const from = exchangeRates[fromCurrency] ?? 1
  const to   = exchangeRates[toCurrency]   ?? 1
  const inUSD = Number(amount) / from
  return Math.round(inUSD * to * 100) / 100
}

/**
 * Devuelve el símbolo de una moneda.
 * @param {string} currency
 * @returns {string}
 */
export function getSymbol(currency = 'DOP') {
  return currencySymbols[currency] || currency
}

/**
 * Formatea un número como precio con símbolo.
 * @param {number} amount
 * @param {string} currency
 * @returns {string}  → "RD$1,250" | "US$21.05" | "€18.40"
 */
export function formatPrice(amount, currency = 'DOP') {
  const num = Number(amount) || 0
  const sym = getSymbol(currency)
  const locale = currencyLocale[currency] || 'es-DO'
  const decimals = NO_DECIMALS.has(currency) ? 0 : 2
  const formatted = new Intl.NumberFormat(locale, {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(num)
  return `${sym}${formatted}`
}

/**
 * Convierte Y formatea de una vez.
 * @param {number} amount       Monto en fromCurrency
 * @param {string} fromCurrency Moneda origen
 * @param {string} toCurrency   Moneda destino
 * @returns {string}
 */
export function priceIn(amount, fromCurrency, toCurrency) {
  return formatPrice(convertPrice(amount, fromCurrency, toCurrency), toCurrency)
}

/** Lista de monedas disponibles para el selector de configuración */
export const currencyList = [
  { code: 'DOP', name: 'Peso dominicano',  symbol: 'RD$' },
  { code: 'USD', name: 'Dólar americano',  symbol: 'US$' },
  { code: 'EUR', name: 'Euro',             symbol: '€'   },
  { code: 'GBP', name: 'Libra esterlina',  symbol: '£'   },
  { code: 'MXN', name: 'Peso mexicano',    symbol: '$'   },
  { code: 'COP', name: 'Peso colombiano',  symbol: '$'   },
  { code: 'ARS', name: 'Peso argentino',   symbol: '$'   },
  { code: 'CLP', name: 'Peso chileno',     symbol: '$'   },
  { code: 'PEN', name: 'Sol peruano',      symbol: 'S/'  },
  { code: 'BRL', name: 'Real brasileño',   symbol: 'R$'  },
  { code: 'CAD', name: 'Dólar canadiense', symbol: 'CA$' },
  { code: 'JPY', name: 'Yen japonés',      symbol: '¥'   },
  { code: 'CHF', name: 'Franco suizo',     symbol: 'CHF' },
  { code: 'AUD', name: 'Dólar australiano',symbol: 'A$'  },
  { code: 'CNY', name: 'Yuan chino',       symbol: '¥'   },
  { code: 'INR', name: 'Rupia india',      symbol: '₹'   },
  { code: 'KRW', name: 'Won surcoreano',   symbol: '₩'   },
  { code: 'SGD', name: 'Dólar singapurense',symbol: 'S$' },
  { code: 'AED', name: 'Dírham emiratí',   symbol: 'د.إ' },
  { code: 'SAR', name: 'Riyal saudí',      symbol: '﷼'   },
  { code: 'TRY', name: 'Lira turca',       symbol: '₺'   },
  { code: 'ZAR', name: 'Rand sudafricano', symbol: 'R'   },
]
