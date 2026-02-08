import { isSupabaseConfigured, supabase } from "./supabase"

const cleanText = (value, fallback = "") => {
  const text = `${value ?? ""}`.trim()
  return text || fallback
}

const normalizeRoutine = (row) => ({
  id: row.id,
  title: cleanText(row.title, "Routine"),
  meta: cleanText(row.meta),
  description: cleanText(row.description),
  exercises: Array.isArray(row.exercises) ? row.exercises : [],
})

export const listWorkoutRoutines = async ({ userId }) => {
  if (!isSupabaseConfigured || !userId) return { data: [], error: null }

  const { data, error } = await supabase
    .from("workout_routines")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false })

  return { data: (data || []).map(normalizeRoutine), error }
}

export const createWorkoutRoutine = async ({ userId, routine }) => {
  if (!isSupabaseConfigured || !userId || !routine) return { data: null, error: null }

  const payload = {
    user_id: userId,
    title: cleanText(routine.title, "Routine"),
    meta: cleanText(routine.meta),
    description: cleanText(routine.description),
    exercises: Array.isArray(routine.exercises) ? routine.exercises : [],
  }

  const { data, error } = await supabase.from("workout_routines").insert(payload).select("*").single()
  return { data: data ? normalizeRoutine(data) : null, error }
}

export const deleteWorkoutRoutine = async ({ userId, routineId }) => {
  if (!isSupabaseConfigured || !userId || !routineId) return { error: null }
  const { error } = await supabase
    .from("workout_routines")
    .delete()
    .eq("user_id", userId)
    .eq("id", routineId)
  return { error }
}

export const addWorkoutSession = async ({ userId, title, exerciseCount, setCount }) => {
  if (!isSupabaseConfigured || !userId) return { error: null }
  const payload = {
    user_id: userId,
    title: cleanText(title, "Workout"),
    exercise_count: Number.isFinite(Number(exerciseCount)) ? Number(exerciseCount) : 0,
    set_count: Number.isFinite(Number(setCount)) ? Number(setCount) : 0,
  }
  const { error } = await supabase.from("workout_sessions").insert(payload)
  return { error }
}
