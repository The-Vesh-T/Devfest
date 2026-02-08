import { useMemo, useState } from "react";
import "./App.css";

import PhoneFrame from "./components/PhoneFrame";
import TopBar from "./components/TopBar";
import BottomNav from "./components/BottomNav";
import FoodAddSheet from "./components/FoodAddSheet";
import DaySelector from "./components/DaySelector";
import PostSheet from "./components/PostSheet";

import HomeScreen from "./screens/HomeScreen";
import FoodScreen from "./screens/FoodScreen";
import WorkoutsScreen from "./screens/WorkoutsScreen";

export default function App() {
  const [tab, setTab] = useState("home");
  const [sheetOpen, setSheetOpen] = useState(false);
  const [posts, setPosts] = useState([]);
  const [customFoods, setCustomFoods] = useState([]);
  const [selectedDate, setSelectedDate] = useState(() => new Date());

  const isWorkoutTab = tab === "workouts";
  const isHomeTab = tab === "home";
  const mode = isWorkoutTab ? "workout" : "food";

  const meals = useMemo(
    () => [
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
      ...customFoods,
    ],
    [customFoods]
  );

  const handleCreateFood = (food) => {
    setCustomFoods((prev) => [{ ...food, id: `custom_${Date.now()}` }, ...prev]);
  };

  const handleAddMealFromScan = (meal) => {
    if (!meal) return;
    setCustomFoods((prev) => [{ ...meal, id: `scan_${Date.now()}`, favorite: false }, ...prev]);
  };

  const handleToggleFavorite = (id) => {
    setCustomFoods((prev) =>
      prev.map((food) => (food.id === id ? { ...food, favorite: !food.favorite } : food))
    );
  };

  const handleDateChange = (nextDate) => setSelectedDate(nextDate);

  return (
    <div className="stage">
      <PhoneFrame>
        <div className="app">
          <TopBar title="Valetudo" withDay={tab === "food"}>
            {tab === "food" ? <DaySelector selectedDate={selectedDate} onChangeDate={handleDateChange} /> : null}
          </TopBar>

          <main className={`content ${tab === "food" ? "foodContent" : ""}`}>
            {tab === "home" && <HomeScreen posts={posts} />}
            {tab === "food" && <FoodScreen meals={meals} />}
            {tab === "workouts" && <WorkoutsScreen />}
          </main>

          {isHomeTab ? (
            <button className="fab" onClick={() => setSheetOpen(true)} aria-label="Create post">
              <svg viewBox="0 0 24 24" width="26" height="26" aria-hidden="true">
                <path
                  d="M4 16.5V20h3.5L18 9.5 14.5 6 4 16.5zM19.5 8a1 1 0 0 0 0-1.4L17.4 4.5a1 1 0 0 0-1.4 0l-1.6 1.6 3.5 3.5 1.6-1.6z"
                  fill="currentColor"
                />
              </svg>
            </button>
          ) : (
            <button
              className={`fab ${mode === "food" ? "fabFood" : ""}`}
              onClick={() => {
                if (isWorkoutTab) {
                  window.dispatchEvent(new Event("open-workout-actions"));
                  return;
                }
                setSheetOpen(true);
              }}
              aria-label="Add"
            >
              +
            </button>
          )}

          <BottomNav tab={tab} setTab={setTab} />
        </div>

        {isHomeTab ? (
          <PostSheet
            open={sheetOpen}
            onClose={() => setSheetOpen(false)}
            onPost={(post) => {
              setPosts((prev) => [
                {
                  id: Date.now(),
                  author: "You",
                  time: "now",
                  title: post.title,
                  body: post.body,
                  likes: 0,
                  replies: 0,
                },
                ...prev,
              ]);
            }}
          />
        ) : (
        <FoodAddSheet
          open={sheetOpen}
          onClose={() => setSheetOpen(false)}
          mode={mode}
          onCreateFood={handleCreateFood}
          customFoods={customFoods}
          onToggleFavorite={handleToggleFavorite}
          onAddMealFromScan={handleAddMealFromScan}
        />
        )}
      </PhoneFrame>
    </div>
  );
}
