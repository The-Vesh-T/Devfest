import { useState } from "react";
import "./App.css";

import PhoneFrame from "./components/PhoneFrame";
import TopBar from "./components/TopBar";
import BottomNav from "./components/BottomNav";
import QuickAddSheet from "./components/QuickAddSheet";

import HomeScreen from "./screens/HomeScreen";
import FoodScreen from "./screens/FoodScreen";
import WorkoutsScreen from "./screens/WorkoutsScreen";

export default function App() {
  const [tab, setTab] = useState("home"); // home | food | workouts
  const [sheetOpen, setSheetOpen] = useState(false);
  const isWorkoutTab = tab === "workouts";

  const mode = isWorkoutTab ? "workout" : "food";

  return (
    <div className="stage">
      <PhoneFrame>
        <div className="app">
          <TopBar title="Valetudo" />

          <main className="content">
            {tab === "home" && <HomeScreen />}
            {tab === "food" && <FoodScreen />}
            {tab === "workouts" && <WorkoutsScreen />}
          </main>

          {tab !== "home" && (
            <button
              className="fab"
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

        <QuickAddSheet open={sheetOpen} onClose={() => setSheetOpen(false)} mode={mode} />
      </PhoneFrame>
    </div>
  );
}
