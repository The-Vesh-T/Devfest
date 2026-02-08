import { isSupabaseConfigured, supabase } from "./supabase"

const toNumber = (value) => {
  const n = Number(value)
  return Number.isFinite(n) ? Math.round(n) : 0
}

const cleanText = (value, fallback = "") => {
  const text = `${value ?? ""}`.trim()
  return text || fallback
}

export const toDateKey = (dateLike) => {
  const date = dateLike instanceof Date ? dateLike : new Date(dateLike)
  const y = date.getFullYear()
  const m = `${date.getMonth() + 1}`.padStart(2, "0")
  const d = `${date.getDate()}`.padStart(2, "0")
  return `${y}-${m}-${d}`
}

const normalizeFood = (row) => ({
  id: row.id,
  name: cleanText(row.name, "Custom food"),
  servings: Number(row.servings) > 0 ? Number(row.servings) : 1,
  calories: toNumber(row.calories),
  protein: toNumber(row.protein),
  carbs: toNumber(row.carbs),
  fat: toNumber(row.fat),
  detail: cleanText(row.detail),
  favorite: Boolean(row.favorite),
})

const normalizeMeal = (row) => ({
  id: row.id,
  name: cleanText(row.name, "Meal"),
  calories: toNumber(row.calories),
  protein: toNumber(row.protein),
  carbs: toNumber(row.carbs),
  fat: toNumber(row.fat),
  detail: cleanText(row.detail),
})

export const listCustomFoods = async (userId) => {
  if (!isSupabaseConfigured || !userId) return { data: [], error: null }
  const { data, error } = await supabase
    .from("custom_foods")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false })

  return { data: (data || []).map(normalizeFood), error }
}

export const createCustomFood = async ({ userId, food }) => {
  if (!isSupabaseConfigured || !userId || !food) return { data: null, error: null }

  const payload = {
    user_id: userId,
    name: cleanText(food.name, "Custom food"),
    servings: Number(food.servings) > 0 ? Number(food.servings) : 1,
    calories: toNumber(food.calories),
    protein: toNumber(food.protein),
    carbs: toNumber(food.carbs),
    fat: toNumber(food.fat),
    detail: cleanText(food.detail),
    favorite: Boolean(food.favorite),
  }

  const { data, error } = await supabase.from("custom_foods").insert(payload).select("*").single()
  return { data: data ? normalizeFood(data) : null, error }
}

export const toggleFavoriteFood = async ({ userId, id, favorite }) => {
  if (!isSupabaseConfigured || !userId || !id) return { error: null }
  const { error } = await supabase
    .from("custom_foods")
    .update({ favorite: Boolean(favorite) })
    .eq("id", id)
    .eq("user_id", userId)
  return { error }
}

export const listMealEntries = async ({ userId, dateKey }) => {
  if (!isSupabaseConfigured || !userId || !dateKey) return { data: [], error: null }
  const { data, error } = await supabase
    .from("meal_entries")
    .select("*")
    .eq("user_id", userId)
    .eq("consumed_on", dateKey)
    .order("created_at", { ascending: false })

  return { data: (data || []).map(normalizeMeal), error }
}

export const addMealEntry = async ({ userId, dateKey, meal, source = "manual", barcode = null }) => {
  if (!isSupabaseConfigured || !userId || !dateKey || !meal) return { data: null, error: null }

  const payload = {
    user_id: userId,
    consumed_on: dateKey,
    name: cleanText(meal.name, "Meal"),
    calories: toNumber(meal.calories),
    protein: toNumber(meal.protein),
    carbs: toNumber(meal.carbs),
    fat: toNumber(meal.fat),
    detail: cleanText(meal.detail),
    source: cleanText(source, "manual"),
    barcode: barcode ? cleanText(barcode) : null,
  }

  const { data, error } = await supabase.from("meal_entries").insert(payload).select("*").single()
  return { data: data ? normalizeMeal(data) : null, error }
}
