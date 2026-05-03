import storageService from './storageService.js'

export const diagnosisService = {
  getLatestDiagnosis() {
    return storageService.get('diagnostic_result', null)
  },

  getDiagnoses() {
    return storageService.get('diagnostics_history', [])
  },

  saveDiagnosis(data) {
    const entry = { ...data, id: Date.now(), date: new Date().toISOString() }
    const history = this.getDiagnoses()
    history.unshift(entry)
    storageService.set('diagnostics_history', history.slice(0, 20))
    storageService.set('diagnostic_result', entry)
    return entry
  },

  hasDiagnosis() {
    return !!storageService.get('diagnostic_result', null)
  },
}

export default diagnosisService
