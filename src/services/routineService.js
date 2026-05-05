import storageService from './storageService.js'
import { supabase, isSupabaseConfigured } from '../lib/supabaseClient.js'

export const routineService = {
  async getLatestRoutine() {
    // Try Supabase first
    if (isSupabaseConfigured) {
      try {
        const { data: { user } } = await supabase.auth.getUser()
        if (user) {
          const { data, error } = await supabase
            .from('routines')
            .select(`
              *,
              routine_steps (
                *,
                products (*)
              ),
              routine_products (
                *,
                products (*)
              )
            `)
            .eq('user_id', user.id)
            .eq('is_active', true)
            .order('created_at', { ascending: false })
            .limit(1)
            .maybeSingle()

          if (!error && data) {
            return this.formatRoutineFromDB(data)
          }
        }
      } catch (e) {
        console.warn('[RoutineService] Supabase load failed:', e)
      }
    }

    // Fallback to localStorage
    const routines = storageService.get('routines', [])
    return routines[0] || null
  },

  async getRoutines() {
    // Try Supabase first
    if (isSupabaseConfigured) {
      try {
        const { data: { user } } = await supabase.auth.getUser()
        if (user) {
          const { data, error } = await supabase
            .from('routines')
            .select(`
              *,
              routine_steps (
                *,
                products (*)
              )
            `)
            .eq('user_id', user.id)
            .order('created_at', { ascending: false })

          if (!error && data) {
            return data.map(r => this.formatRoutineFromDB(r))
          }
        }
      } catch (e) {
        console.warn('[RoutineService] Supabase load failed:', e)
      }
    }

    // Fallback to localStorage
    return storageService.get('routines', [])
  },

  async saveRoutine(routineData) {
    const entry = {
      ...routineData,
      id: Date.now(),
      date: new Date().toISOString(),
      is_active: true
    }

    // Save to localStorage first
    try {
      const routines = storageService.get('routines', [])
      routines.unshift(entry)
      storageService.set('routines', routines.slice(0, 10))
    } catch (e) {
      console.warn('[RoutineService] localStorage save failed:', e)
    }

    // Try Supabase
    if (isSupabaseConfigured) {
      try {
        const { data: { user } } = await supabase.auth.getUser()
        if (user) {
          // Insert routine
          const { data: routineResult, error: routineError } = await supabase
            .from('routines')
            .insert({
              user_id: user.id,
              analysis_id: routineData.analysisId || null,
              name: routineData.name || 'Mi rutina personalizada',
              primary_concern: routineData.primaryConcern,
              skin_type_code: routineData.skinType,
              is_active: true
            })
            .select('id')
            .single()

          if (routineError) {
            console.warn('[RoutineService] Routine insert failed:', routineError)
            return entry
          }

          const routineId = routineResult.id

          // Insert routine steps
          if (routineData.morningSteps?.length || routineData.nightSteps?.length) {
            const stepsToInsert = []

            // Morning steps
            if (routineData.morningSteps) {
              routineData.morningSteps.forEach((step, index) => {
                stepsToInsert.push({
                  routine_id: routineId,
                  time_of_day: 'morning',
                  step_number: index + 1,
                  product_id: step.id || null,
                  category: step.category || 'GENERAL',
                  note: step.note || null
                })
              })
            }

            // Night steps
            if (routineData.nightSteps) {
              routineData.nightSteps.forEach((step, index) => {
                stepsToInsert.push({
                  routine_id: routineId,
                  time_of_day: 'night',
                  step_number: index + 1,
                  product_id: step.id || null,
                  category: step.category || 'GENERAL',
                  note: step.note || null
                })
              })
            }

            if (stepsToInsert.length > 0) {
              const { error: stepsError } = await supabase
                .from('routine_steps')
                .insert(stepsToInsert)

              if (stepsError) {
                console.warn('[RoutineService] Steps insert failed:', stepsError)
              }
            }
          }

          // Update entry with Supabase ID
          entry.supabaseId = routineId
        }
      } catch (e) {
        console.warn('[RoutineService] Supabase save failed:', e)
      }
    }

    return entry
  },

  formatRoutineFromDB(dbRoutine) {
    // Transform Supabase data to match localStorage format
    const routine = {
      id: dbRoutine.id,
      name: dbRoutine.name,
      primaryConcern: dbRoutine.primary_concern,
      skinType: dbRoutine.skin_type_code,
      date: dbRoutine.created_at,
      is_active: dbRoutine.is_active,
      morningSteps: [],
      nightSteps: []
    }

    // Process routine_steps
    if (dbRoutine.routine_steps) {
      dbRoutine.routine_steps.forEach(step => {
        const stepData = {
          id: step.product_id,
          step: step.step_number,
          category: step.category,
          note: step.note,
          ...step.products // Include product details if joined
        }

        if (step.time_of_day === 'morning') {
          routine.morningSteps.push(stepData)
        } else if (step.time_of_day === 'night') {
          routine.nightSteps.push(stepData)
        }
      })
    }

    // Fallback: if the response contains routine_products but no routine_steps, use that instead
    if (!routine.morningSteps.length && !routine.nightSteps.length && dbRoutine.routine_products) {
      dbRoutine.routine_products.forEach(step => {
        const stepData = {
          id: step.product_id,
          step: step.step_number,
          category: step.category,
          note: step.note,
          ...step.products,
        }

        if (step.time_of_day === 'morning') {
          routine.morningSteps.push(stepData)
        } else if (step.time_of_day === 'night') {
          routine.nightSteps.push(stepData)
        }
      })
    }

    return routine
  },

  hasRoutine() {
    return this.getRoutines().length > 0
  },
}

export default routineService
