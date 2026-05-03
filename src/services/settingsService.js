import storageService from './storageService.js'

const DEFAULTS = {
  isDark: false,
  language: 'es',
  country: 'DO',
  currency: 'DOP',
}

export const settingsService = {
  getSettings() {
    return storageService.get('settings', DEFAULTS)
  },

  getSetting(key, fallback = null) {
    const s = this.getSettings()
    return key in s ? s[key] : (fallback ?? DEFAULTS[key] ?? null)
  },

  saveSettings(data) {
    const current = this.getSettings()
    const merged = { ...current, ...data }
    storageService.set('settings', merged)
    return merged
  },

  reset() {
    storageService.set('settings', DEFAULTS)
    return DEFAULTS
  },
}

export default settingsService
