import { useState } from "react";
import "./App.css";

import PhoneFrame from "./components/PhoneFrame";
import TopBar from "./components/TopBar";
import BottomNav from "./components/BottomNav";
import AddSheet from "./components/AddSheet";
import PostSheet from "./components/PostSheet";

import HomeScreen from "./screens/HomeScreen";
import FoodScreen from "./screens/FoodScreen";
import WorkoutsScreen from "./screens/WorkoutsScreen";

export default function App() {
  const [tab, setTab] = useState("home"); 
  const [sheetOpen, setSheetOpen] = useState(false);
  const [posts, setPosts] = useState([]);

  const mode = tab === "home" ? "post" : tab === "workouts" ? "workout" : "food";

  return (
    <div className="stage">
      <PhoneFrame>
        <div className="app">
          <TopBar title="Valetudo" />

          <main className="content">
            {tab === "home" && <HomeScreen posts={posts} />}
            {tab === "food" && <FoodScreen />}
            {tab === "workouts" && <WorkoutsScreen />}
          </main>

          <button className="fab" onClick={() => setSheetOpen(true)} aria-label="Create post">
            <svg viewBox="0 0 24 24" width="26" height="26" aria-hidden="true">
              <path
                d="M4 16.5V20h3.5L18 9.5 14.5 6 4 16.5zM19.5 8a1 1 0 0 0 0-1.4L17.4 4.5a1 1 0 0 0-1.4 0l-1.6 1.6 3.5 3.5 1.6-1.6z"
                fill="currentColor"
              />
            </svg>
          </button>

          <BottomNav tab={tab} setTab={setTab} />
        </div>

        {tab === "home" ? (
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
          <AddSheet open={sheetOpen} onClose={() => setSheetOpen(false)} mode={mode} />
        )}
      </PhoneFrame>
    </div>
  );
}
