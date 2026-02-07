import { useMemo, useState } from "react";
import "./App.css";

import PhoneFrame from "./components/PhoneFrame";
import TopBar from "./components/TopBar";
import BottomNav from "./components/BottomNav";
import FoodAddSheet from "./components/FoodAddSheet";
import DaySelector from "./components/DaySelector";

import HomeScreen from "./screens/HomeScreen";
import FoodScreen from "./screens/FoodScreen";
import WorkoutsScreen from "./screens/WorkoutsScreen";

export default function App() {
  const [tab, setTab] = useState("home"); // home | food | workouts
  const [sheetOpen, setSheetOpen] = useState(false);
  const [customFoods, setCustomFoods] = useState([]);
  const [activeDay, setActiveDay] = useState(() => new Date().getDay());
  const isWorkoutTab = tab === "workouts";

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

  const handleToggleFavorite = (id) => {
    setCustomFoods((prev) =>
      prev.map((food) => (food.id === id ? { ...food, favorite: !food.favorite } : food))
    );
  };

  const prevDay = () => setActiveDay((idx) => (idx - 1 + 7) % 7);
  const nextDay = () => setActiveDay((idx) => (idx + 1) % 7);

  return (
    <div className="stage">
      <PhoneFrame>
        <div className="app">
          <TopBar title="Valetudo" withDay={tab === "food"}>
            {tab === "food" ? <DaySelector activeDay={activeDay} onPrev={prevDay} onNext={nextDay} /> : null}
          </TopBar>

          <main className={`content ${tab === "food" ? "foodContent" : ""}`}>
            {tab === "home" && <HomeScreen />}
            {tab === "food" && <FoodScreen meals={meals} />}
            {tab === "workouts" && <WorkoutsScreen />}
          </main>

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

          <BottomNav tab={tab} setTab={setTab} />
        </div>

        <FoodAddSheet
          open={sheetOpen}
          onClose={() => setSheetOpen(false)}
          mode={mode}
          onCreateFood={handleCreateFood}
          customFoods={customFoods}
          onToggleFavorite={handleToggleFavorite}
        />
      </PhoneFrame>
    </div>
  );
}
