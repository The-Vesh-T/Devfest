import { isSupabaseConfigured, supabase } from "./supabase"

const cleanText = (value, fallback = "") => {
  const text = `${value ?? ""}`.trim()
  return text || fallback
}

const normalizeExerciseName = (value) => cleanText(value).toLowerCase()

const toNumberOrNull = (value) => {
  if (value === "" || value == null) return null
  const parsed = Number(value)
  return Number.isFinite(parsed) ? parsed : null
}

const toIntOrNull = (value) => {
  if (value === "" || value == null) return null
  const parsed = Number.parseInt(value, 10)
  return Number.isFinite(parsed) ? parsed : null
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

export const addWorkoutSessionWithSets = async ({
  userId,
  title,
  exerciseCount,
  setCount,
  exercises,
}) => {
  if (!isSupabaseConfigured || !userId) return { error: null }

  const sessionPayload = {
    user_id: userId,
    title: cleanText(title, "Workout"),
    exercise_count: Number.isFinite(Number(exerciseCount)) ? Number(exerciseCount) : 0,
    set_count: Number.isFinite(Number(setCount)) ? Number(setCount) : 0,
  }

  const { data: session, error: sessionError } = await supabase
    .from("workout_sessions")
    .insert(sessionPayload)
    .select("id")
    .single()

  if (sessionError || !session?.id) return { error: sessionError || new Error("Failed to create workout session") }

  const entries = (Array.isArray(exercises) ? exercises : []).flatMap((exercise) => {
    const exerciseName = cleanText(exercise?.name)
    if (!exerciseName) return []

    return (Array.isArray(exercise?.sets) ? exercise.sets : []).map((set, idx) => ({
      user_id: userId,
      session_id: session.id,
      exercise_name: exerciseName,
      set_index: idx + 1,
      weight: toNumberOrNull(set?.weight),
      reps: toIntOrNull(set?.reps),
      failure: Boolean(set?.failure),
      dropset: Boolean(set?.dropset),
    }))
  })

  if (entries.length === 0) return { error: null }

  const { error } = await supabase.from("workout_set_entries").insert(entries)
  return { error }
}

export const listLastExerciseSets = async ({ userId, exerciseNames }) => {
  if (!isSupabaseConfigured || !userId) return { data: {}, error: null }

  const requestedNames = (Array.isArray(exerciseNames) ? exerciseNames : [])
    .map((name) => cleanText(name))
    .filter(Boolean)

  if (requestedNames.length === 0) return { data: {}, error: null }

  const normalizedToRequested = requestedNames.reduce((acc, name) => {
    const normalized = normalizeExerciseName(name)
    if (!normalized) return acc
    acc[normalized] = name
    return acc
  }, {})

  const normalizedTargets = new Set(Object.keys(normalizedToRequested))
  if (normalizedTargets.size === 0) return { data: {}, error: null }

  const { data, error } = await supabase
    .from("workout_set_entries")
    .select("exercise_name, weight, reps, created_at, set_index")
    .eq("user_id", userId)
    .order("created_at", { ascending: false })
    .order("set_index", { ascending: false })
    .limit(2000)

  if (error) return { data: {}, error }

  const output = {}
  for (const row of data || []) {
    const normalized = normalizeExerciseName(row.exercise_name)
    if (!normalizedTargets.has(normalized)) continue
    const requestedKey = normalizedToRequested[normalized]
    if (!requestedKey || output[requestedKey]) continue

    if (row.weight == null && row.reps == null) continue
    output[requestedKey] = {
      weight: row.weight,
      reps: row.reps,
    }
  }

  return { data: output, error: null }
}
