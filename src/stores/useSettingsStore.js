import { ref } from 'vue'
import { setGlobalLang } from '../lib/i18n.js'
import { countryList, countryCurrencyMap } from '../data/countries.js'
import { currencyList } from '../utils/currency.js'

const isDark   = ref(false)
const language = ref('es')
const country  = ref('DO')
const currency = ref('DOP')

function _applyDark() {
  const html = document.documentElement
  if (isDark.value) {
    html.classList.remove('light')
    html.classList.add('dark')
  } else {
    html.classList.remove('dark')
    html.classList.add('light')
  }
}

function _load() {
  try {
    const saved = localStorage.getItem('pharmaderm_settings')
    if (saved) {
      const s = JSON.parse(saved)
      isDark.value   = s.isDark    ?? false
      language.value = s.language  ?? 'es'
      country.value  = s.country   ?? 'DO'
      currency.value = s.currency  ?? 'DOP'
    } else {
      // Backward compat
      isDark.value   = localStorage.getItem('pharmaderm_dark') === '1'
      language.value = 'es'
      country.value  = 'DO'
      currency.value = 'DOP'
    }
  } catch {
    isDark.value   = false
    language.value = 'es'
    country.value  = 'DO'
    currency.value = 'DOP'
  }
  _applyDark()
  setGlobalLang(language.value)
}
_load()

function _save() {
  localStorage.setItem('pharmaderm_settings', JSON.stringify({
    isDark:   isDark.value,
    language: language.value,
    country:  country.value,
    currency: currency.value,
  }))
  localStorage.setItem('pharmaderm_dark', isDark.value ? '1' : '0')
}

export function useSettingsStore() {
  function toggleDark() {
    isDark.value = !isDark.value
    _applyDark()
    _save()
  }

  function setDark(value) {
    isDark.value = value
    _applyDark()
    _save()
  }

  function setLanguage(lang) {
    language.value = lang
    setGlobalLang(lang)
    _save()
  }

  function setCountry(code) {
    country.value = code
    // Auto-seleccionar moneda del país
    const defaultCurrency = countryCurrencyMap[code]
    if (defaultCurrency) currency.value = defaultCurrency
    _save()
  }

  function setCurrency(code) {
    currency.value = code
    _save()
  }

  return {
    isDark, language, country, currency,
    countryList, currencyList,
    toggleDark, setDark, setLanguage, setCountry, setCurrency,
  }
}
