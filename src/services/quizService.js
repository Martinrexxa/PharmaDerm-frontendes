import storageService from './storageService.js'

export const quizService = {
  getLatestResult() {
    return storageService.get('quiz_result', null)
  },

  getHistory() {
    return storageService.get('quiz_history', [])
  },

  saveResult(data) {
    const entry = { ...data, id: Date.now(), date: new Date().toISOString(), completed: true }
    const history = this.getHistory()
    history.unshift(entry)
    storageService.set('quiz_history', history.slice(0, 20))
    storageService.set('quiz_result', entry)
    return entry
  },

  hasResult() {
    return !!storageService.get('quiz_result', null)
  },

  clearHistory() {
    storageService.remove('quiz_history')
    storageService.remove('quiz_result')
  },
}

export default quizService
