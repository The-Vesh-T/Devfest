import { useCallback, useEffect, useMemo, useState } from "react"
import "./App.css"

import PhoneFrame from "./components/PhoneFrame"
import TopBar from "./components/TopBar"
import BottomNav from "./components/BottomNav"
import FoodAddSheet from "./components/FoodAddSheet"
import DaySelector from "./components/DaySelector"
import PostSheet from "./components/PostSheet"

import HomeScreen from "./screens/HomeScreen"
import FoodScreen from "./screens/FoodScreen"
import WorkoutsScreen from "./screens/WorkoutsScreen"
import logo from "./assets/devfest-logo.svg"
import {
  addMealEntry,
  createCustomFood,
  deleteMealEntry,
  listCommonMeals,
  listCustomFoods,
  listMealEntries,
  toDateKey,
  toggleFavoriteFood,
  updateMealEntry,
} from "./lib/foodRepo"
import {
  addPostComment,
  createFeedPost,
  listFeedPosts,
  setPostLike,
} from "./lib/socialRepo"
import { isSupabaseConfigured } from "./lib/supabase"

const ACCOUNTS = [
  {
    login: "demo@devfest.app",
    password: "DemoPass123!",
    name: "Aisha Patel",
    displayName: "Aisha",
    handle: "@aisha",
    email: "demo@devfest.app",
    bio: "Strength + mobility. Learning to love rest days.",
  },
  {
    login: "user",
    password: "pass",
    name: "Pork Sandwich",
    displayName: "Pork",
    handle: "@pork",
    email: "user",
    bio: "Pork-fueled lifts and sandwich-fueled recovery.",
  },
]

const BASE_MEALS = [
  {
    id: 1,
    name: "Lunch",
    calories: 400,
    protein: 32,
    carbs: 45,
    fat: 14,
    detail: "Chicken bowl • rice • veggies",
  },
  {
    id: 2,
    name: "Snack",
    calories: 220,
    protein: 18,
    carbs: 24,
    fat: 6,
    detail: "Greek yogurt • honey",
  },
]

const toSafeNumber = (value) => {
  const n = Number(value)
  return Number.isFinite(n) ? Math.round(n) : 0
}

const toLocalCustomFood = (food) => ({
  id: `custom_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
  name: `${food?.name ?? "Custom food"}`.trim() || "Custom food",
  servings: Number(food?.servings) > 0 ? Number(food.servings) : 1,
  calories: toSafeNumber(food?.calories),
  protein: toSafeNumber(food?.protein),
  carbs: toSafeNumber(food?.carbs),
  fat: toSafeNumber(food?.fat),
  detail: `${food?.detail ?? ""}`.trim(),
  favorite: Boolean(food?.favorite),
})

const toLocalMeal = (meal) => ({
  id: `meal_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
  name: `${meal?.name ?? "Meal"}`.trim() || "Meal",
  calories: toSafeNumber(meal?.calories),
  protein: toSafeNumber(meal?.protein),
  carbs: toSafeNumber(meal?.carbs),
  fat: toSafeNumber(meal?.fat),
  detail: `${meal?.detail ?? ""}`.trim(),
  barcode: meal?.barcode ? `${meal.barcode}`.trim() : null,
})

const toLocalPost = ({ author, title, body }) => ({
  id: `post_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
  author: `${author ?? "You"}`.trim() || "You",
  time: "now",
  title: `${title ?? "Post"}`.trim() || "Post",
  body: `${body ?? ""}`.trim(),
  likes: 0,
  replies: 0,
  likedByMe: false,
  pinned: false,
})

const formatDuration = (totalSeconds) => {
  const safeSeconds = Number.isFinite(Number(totalSeconds)) ? Math.max(0, Math.floor(Number(totalSeconds))) : 0
  const hours = Math.floor(safeSeconds / 3600)
  const minutes = Math.floor((safeSeconds % 3600) / 60)
  const seconds = safeSeconds % 60
  if (hours > 0) {
    return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`
  }
  return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`
}

export default function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [sessionUser, setSessionUser] = useState(ACCOUNTS[0])
  const [loginEmail, setLoginEmail] = useState("")
  const [loginPassword, setLoginPassword] = useState("")
  const [loginError, setLoginError] = useState("")
  const [tab, setTab] = useState("home")
  const [sheetOpen, setSheetOpen] = useState(false)
  const [posts, setPosts] = useState([])
  const [commonMeals, setCommonMeals] = useState(BASE_MEALS)
  const [customFoods, setCustomFoods] = useState([])
  const [favoriteCommonMealIds, setFavoriteCommonMealIds] = useState([])
  const [mealEntries, setMealEntries] = useState([])
  const [selectedDate, setSelectedDate] = useState(() => new Date())
  const [isWorkoutActive, setIsWorkoutActive] = useState(false)

  const isWorkoutTab = tab === "workouts"
  const isHomeTab = tab === "home"
  const mode = isWorkoutTab ? "workout" : "food"
  const currentUserId = sessionUser?.login || "anon"
  const favoriteCommonMealsStorageKey = `favorite_common_meals_${currentUserId}`
  const selectedDateKey = useMemo(() => toDateKey(selectedDate), [selectedDate])

  const meals = useMemo(() => [...mealEntries], [mealEntries])
  const allMealOptions = useMemo(() => [...commonMeals, ...customFoods], [commonMeals, customFoods])
  const favoriteMeals = useMemo(() => {
    const favoriteCustomFoods = customFoods.filter((food) => food.favorite)
    const favoriteCommonMeals = commonMeals.filter((meal) => favoriteCommonMealIds.includes(meal.id))
    return [...favoriteCommonMeals, ...favoriteCustomFoods]
  }, [commonMeals, customFoods, favoriteCommonMealIds])

  const syncCommonMeals = useCallback(async () => {
    if (!isSupabaseConfigured) {
      setCommonMeals(BASE_MEALS)
      return
    }
    const { data, error } = await listCommonMeals()
    if (error) {
      console.error("Failed to load common meals", error)
      setCommonMeals(BASE_MEALS)
      return
    }
    if (!Array.isArray(data) || data.length === 0) {
      setCommonMeals(BASE_MEALS)
      return
    }
    setCommonMeals(data)
  }, [])

  const syncCustomFoods = useCallback(async () => {
    if (!isAuthenticated || !isSupabaseConfigured) return
    const { data, error } = await listCustomFoods(currentUserId)
    if (error) {
      console.error("Failed to load custom foods", error)
      return
    }
    setCustomFoods(data || [])
  }, [isAuthenticated, currentUserId])

  const syncMealEntries = useCallback(async () => {
    if (!isAuthenticated || !isSupabaseConfigured) return
    const { data, error } = await listMealEntries({ userId: currentUserId, dateKey: selectedDateKey })
    if (error) {
      console.error("Failed to load meal entries", error)
      return
    }
    setMealEntries(data || [])
  }, [isAuthenticated, currentUserId, selectedDateKey])

  const syncPosts = useCallback(async () => {
    if (!isAuthenticated || !isSupabaseConfigured) return
    const { data, error } = await listFeedPosts({ userId: currentUserId, limit: 100 })
    if (error) {
      console.error("Failed to load posts", error)
      return
    }
    setPosts(data || [])
  }, [isAuthenticated, currentUserId])

  const buildWorkoutPostBody = (summary) => {
    if (!summary) return ""
    const lines = []
    const exerciseCount = Number.isFinite(Number(summary.exerciseCount)) ? Number(summary.exerciseCount) : 0
    const setCount = Number.isFinite(Number(summary.setCount)) ? Number(summary.setCount) : 0
    lines.push(`Completed ${exerciseCount} exercises and ${setCount} sets.`)
    if (summary.durationLabel) {
      lines.push(`Duration: ${summary.durationLabel}`)
    } else if (Number.isFinite(Number(summary.durationSeconds))) {
      lines.push(`Duration: ${formatDuration(summary.durationSeconds)}`)
    }
    if (Number.isFinite(Number(summary.totalWeight))) {
      lines.push(`Total weight: ${Number(summary.totalWeight)} kg`)
    }
    if (Array.isArray(summary.exercises) && summary.exercises.length > 0) {
      lines.push(`Exercises: ${summary.exercises.join(", ")}`)
    }
    return lines.join("\n")
  }

  useEffect(() => {
    syncCommonMeals()
  }, [syncCommonMeals])

  useEffect(() => {
    if (typeof window === "undefined") return
    try {
      const raw = window.localStorage.getItem(favoriteCommonMealsStorageKey)
      if (!raw) {
        setFavoriteCommonMealIds([])
        return
      }
      const parsed = JSON.parse(raw)
      if (!Array.isArray(parsed)) {
        setFavoriteCommonMealIds([])
        return
      }
      setFavoriteCommonMealIds(parsed)
    } catch {
      setFavoriteCommonMealIds([])
    }
  }, [favoriteCommonMealsStorageKey])

  useEffect(() => {
    if (typeof window === "undefined") return
    window.localStorage.setItem(
      favoriteCommonMealsStorageKey,
      JSON.stringify(favoriteCommonMealIds)
    )
  }, [favoriteCommonMealIds, favoriteCommonMealsStorageKey])
  useEffect(() => {
    if (!isAuthenticated) {
      setCustomFoods([])
      return
    }
    syncCustomFoods()
  }, [isAuthenticated, syncCustomFoods])

  useEffect(() => {
    if (!isAuthenticated) {
      setMealEntries([])
      return
    }
    syncMealEntries()
  }, [isAuthenticated, syncMealEntries])

  useEffect(() => {
    if (!isAuthenticated) {
      setPosts([])
      return
    }
    syncPosts()
  }, [isAuthenticated, syncPosts])

  const addMealToIntake = async ({ meal, source = "manual", barcode = null }) => {
    if (!meal) return
    const localMeal = toLocalMeal(meal)

    if (!isSupabaseConfigured) {
      setMealEntries((prev) => [localMeal, ...prev])
      return
    }

    const { data, error } = await addMealEntry({
      userId: currentUserId,
      dateKey: selectedDateKey,
      meal: localMeal,
      source,
      barcode: barcode ?? localMeal.barcode ?? null,
    })
    if (error || !data) {
      console.error("Failed to add meal entry in Supabase", error)
      setMealEntries((prev) => [localMeal, ...prev])
      return
    }
    setMealEntries((prev) => [data, ...prev])
  }

  const handleCreateFood = async (food) => {
    const localFood = toLocalCustomFood(food)

    if (!isSupabaseConfigured) {
      setCustomFoods((prev) => [localFood, ...prev])
      await addMealToIntake({ meal: localFood, source: "manual" })
      return
    }

    const { data: createdFood, error: createFoodError } = await createCustomFood({
      userId: currentUserId,
      food: localFood,
    })
    if (createFoodError || !createdFood) {
      console.error("Failed to create custom food in Supabase", createFoodError)
      setCustomFoods((prev) => [localFood, ...prev])
      await addMealToIntake({ meal: localFood, source: "manual" })
      return
    }
    setCustomFoods((prev) => [createdFood, ...prev])
    await addMealToIntake({ meal: createdFood, source: "manual" })
  }

  const handleAddMealFromScan = async (meal) => {
    await addMealToIntake({
      meal,
      source: "barcode",
      barcode: meal?.barcode ?? null,
    })
  }

  const handleAddMealFromMenu = async (meal) => {
    await addMealToIntake({
      meal,
      source: "manual",
      barcode: meal?.barcode ?? null,
    })
  }

  const handleEditMealInIntake = async (id, meal) => {
    if (!id || !meal) return
    const nextMeal = toLocalMeal({ ...meal, id })
    const isLocalOnlyId = `${id}`.startsWith("meal_")

    if (!isSupabaseConfigured || isLocalOnlyId) {
      setMealEntries((prev) => prev.map((entry) => (entry.id === id ? { ...entry, ...nextMeal } : entry)))
      return
    }

    const { data, error } = await updateMealEntry({ userId: currentUserId, id, meal: nextMeal })
    if (error || !data) {
      console.error("Failed to update meal entry in Supabase", error)
      setMealEntries((prev) => prev.map((entry) => (entry.id === id ? { ...entry, ...nextMeal } : entry)))
      return
    }
    setMealEntries((prev) => prev.map((entry) => (entry.id === id ? data : entry)))
  }

  const handleDeleteMealFromIntake = async (id) => {
    if (!id) return
    const isLocalOnlyId = `${id}`.startsWith("meal_")
    const previous = mealEntries
    setMealEntries((prev) => prev.filter((entry) => entry.id !== id))

    if (!isSupabaseConfigured || isLocalOnlyId) return

    const { error } = await deleteMealEntry({ userId: currentUserId, id })
    if (error) {
      console.error("Failed to delete meal entry in Supabase", error)
      setMealEntries(previous)
    }
  }

  const handleToggleFavorite = async (id) => {
    const target = customFoods.find((food) => food.id === id)
    if (!target) return
    const nextFavorite = !target.favorite

    setCustomFoods((prev) =>
      prev.map((food) => (food.id === id ? { ...food, favorite: nextFavorite } : food))
    )

    if (!isSupabaseConfigured) return

    const { error } = await toggleFavoriteFood({
      userId: currentUserId,
      id,
      favorite: nextFavorite,
    })
    if (error) {
      console.error("Failed to toggle favorite in Supabase", error)
      setCustomFoods((prev) =>
        prev.map((food) => (food.id === id ? { ...food, favorite: !nextFavorite } : food))
      )
    }
  }

  const isMealFavorite = (meal) => {
    if (!meal?.id) return false
    const customFood = customFoods.find((food) => food.id === meal.id)
    if (customFood) return Boolean(customFood.favorite)
    return favoriteCommonMealIds.includes(meal.id)
  }

  const handleToggleMealFavorite = async (meal) => {
    if (!meal?.id) return

    const customFood = customFoods.find((food) => food.id === meal.id)
    if (customFood) {
      await handleToggleFavorite(meal.id)
      return
    }

    setFavoriteCommonMealIds((prev) =>
      prev.includes(meal.id) ? prev.filter((id) => id !== meal.id) : [meal.id, ...prev]
    )
  }

  const handleDateChange = (nextDate) => setSelectedDate(nextDate)

  const handleCreatePost = async (post) => {
    const localPost = toLocalPost({
      author: sessionUser?.displayName || sessionUser?.name || "You",
      title: post?.title,
      body: post?.body,
    })

    if (!isSupabaseConfigured) {
      setPosts((prev) => [localPost, ...prev])
      return
    }

    const { data, error } = await createFeedPost({
      userId: currentUserId,
      author: localPost.author,
      title: localPost.title,
      body: localPost.body,
    })

    if (error || !data) {
      console.error("Failed to create post in Supabase", error)
      setPosts((prev) => [localPost, ...prev])
      return
    }

    setPosts((prev) => [data, ...prev])
  }

  useEffect(() => {
    const handler = (event) => {
      const summary = event?.detail
      if (!summary) return
      const titleBase = `${summary.title ?? "Workout"}`
      handleCreatePost({
        title: `${titleBase} completed`,
        body: buildWorkoutPostBody(summary),
      })
      setTab("home")
    }
    window.addEventListener("workout-post", handler)
    return () => window.removeEventListener("workout-post", handler)
  }, [handleCreatePost, buildWorkoutPostBody])

  const handleTogglePostLike = async (postId, liked) => {
    if (!postId) return

    if (!isSupabaseConfigured) {
      setPosts((prev) =>
        prev.map((post) => {
          if (post.id !== postId) return post
          const baseLikes = toSafeNumber(post.likes)
          const delta = liked ? 1 : -1
          return {
            ...post,
            likes: Math.max(0, baseLikes + delta),
            likedByMe: liked,
          }
        })
      )
      return
    }

    const { error } = await setPostLike({ userId: currentUserId, postId, liked })
    if (error) {
      console.error("Failed to toggle post like in Supabase", error)
      return
    }
    syncPosts()
  }

  const handleAddPostReply = async (postId, text) => {
    if (!postId || !text) return

    if (!isSupabaseConfigured) {
      setPosts((prev) =>
        prev.map((post) =>
          post.id === postId ? { ...post, replies: toSafeNumber(post.replies) + 1 } : post
        )
      )
      return
    }

    const { error } = await addPostComment({
      userId: currentUserId,
      postId,
      author: sessionUser?.displayName || sessionUser?.name || "You",
      body: text,
    })
    if (error) {
      console.error("Failed to add post comment in Supabase", error)
      return
    }
    syncPosts()
  }

  const handleLogout = () => {
    setIsAuthenticated(false)
    setTab("home")
    setIsWorkoutActive(false)
    setSheetOpen(false)
    setLoginError("")
    setLoginEmail("")
    setLoginPassword("")
    setCustomFoods([])
    setMealEntries([])
  }

  const handleLoginSubmit = (e) => {
    e.preventDefault()
    const email = loginEmail.trim().toLowerCase()
    const password = loginPassword.trim()
    const account = ACCOUNTS.find(
      (candidate) => candidate.login.toLowerCase() === email && candidate.password === password
    )
    if (account) {
      setSessionUser(account)
      setIsAuthenticated(true)
      setLoginError("")
      return
    }
    setLoginError("Wrong email or password.")
  }

  return (
    <div className="stage">
      <PhoneFrame>
        <div className="app">
          {isAuthenticated ? (
            <>
              <TopBar title="Valetudo" withDay={tab === "food"}>
                {tab === "food" ? (
                  <DaySelector selectedDate={selectedDate} onChangeDate={handleDateChange} />
                ) : null}
              </TopBar>

              <main className={`content ${tab === "food" ? "foodContent" : ""}`}>
                {tab === "home" && (
                  <HomeScreen
                    posts={posts}
                    onLogout={handleLogout}
                    currentUser={sessionUser}
                    onTogglePostLike={handleTogglePostLike}
                    onAddPostReply={handleAddPostReply}
                  />
                )}
                {tab === "food" && (
                  <FoodScreen
                    meals={meals}
                    onEditMeal={handleEditMealInIntake}
                    onDeleteMeal={handleDeleteMealFromIntake}
                  />
                )}
                {tab === "workouts" && (
                  <WorkoutsScreen
                    userId={currentUserId}
                    onWorkoutActiveChange={setIsWorkoutActive}
                  />
                )}
              </main>

              {isHomeTab ? (
                <button className="fab" onClick={() => setSheetOpen(true)} aria-label="Create post">
                  <span className="fabPlus" aria-hidden="true">+</span>
                </button>
              ) : isWorkoutTab && isWorkoutActive ? null : (
                <button
                  className={`fab ${mode === "food" ? "fabFood" : ""}`}
                  onClick={() => {
                    if (isWorkoutTab) {
                      window.dispatchEvent(new Event("open-workout-actions"))
                      return
                    }
                    setSheetOpen(true)
                  }}
                  aria-label="Add"
                >
                  <span className="fabPlus" aria-hidden="true">+</span>
                </button>
              )}

              <BottomNav tab={tab} setTab={setTab} />
            </>
          ) : (
            <main className="content loginContent">
              <div className="loginCard">
                <div className="loginBrand">
                  <img src={logo} alt="Valetudo logo" className="loginLogo" />
                  <h1 className="loginTitle">Valetudo</h1>
                </div>
                <p className="loginSubtitle">Sign in to continue</p>
                <form className="loginForm" onSubmit={handleLoginSubmit} autoComplete="off">
                  <input
                    className="input"
                    type="text"
                    autoComplete="off"
                    value={loginEmail}
                    onChange={(e) => setLoginEmail(e.target.value)}
                    placeholder="Email or username"
                  />
                  <input
                    className="input"
                    type="password"
                    autoComplete="off"
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    placeholder="Password"
                  />
                  {loginError ? <div className="loginError">{loginError}</div> : null}
                  <button className="primaryBtn" type="submit">
                    Log in
                  </button>
                </form>
              </div>
            </main>
          )}
        </div>

        {isAuthenticated && isHomeTab ? (
          <PostSheet
            open={sheetOpen}
            onClose={() => setSheetOpen(false)}
            onPost={handleCreatePost}
          />
        ) : isAuthenticated ? (
          <FoodAddSheet
            open={sheetOpen}
            onClose={() => setSheetOpen(false)}
            mode={mode}
            onCreateFood={handleCreateFood}
            allMeals={allMealOptions}
            favoriteMeals={favoriteMeals}
            customFoods={customFoods}
            isMealFavorite={isMealFavorite}
            onToggleMealFavorite={handleToggleMealFavorite}
            onAddMeal={handleAddMealFromMenu}
            onAddMealFromScan={handleAddMealFromScan}
          />
        ) : null}
      </PhoneFrame>
    </div>
  )
}
