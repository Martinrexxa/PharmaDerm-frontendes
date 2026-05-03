import storageService from './storageService.js'

export const routineService = {
  getLatestRoutine() {
    const routines = storageService.get('routines', [])
    return routines[0] || null
  },

  getRoutines() {
    return storageService.get('routines', [])
  },

  saveRoutine(data) {
    const entry = { ...data, id: Date.now(), date: new Date().toISOString() }
    const routines = this.getRoutines()
    routines.unshift(entry)
    storageService.set('routines', routines.slice(0, 10))
    return entry
  },

  hasRoutine() {
    return this.getRoutines().length > 0
  },
}

export default routineService
