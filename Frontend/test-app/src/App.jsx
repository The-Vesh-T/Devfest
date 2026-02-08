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
import logo from "./assets/devfest-logo.svg";

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
];

export default function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [sessionUser, setSessionUser] = useState(ACCOUNTS[0]);
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [loginError, setLoginError] = useState("");
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
  const handleLogout = () => {
    setIsAuthenticated(false);
    setTab("home");
    setSheetOpen(false);
    setLoginError("");
    setLoginEmail("");
    setLoginPassword("");
  };
  const handleLoginSubmit = (e) => {
    e.preventDefault();
    const email = loginEmail.trim().toLowerCase();
    const password = loginPassword.trim();
    const account = ACCOUNTS.find(
      (candidate) =>
        candidate.login.toLowerCase() === email && candidate.password === password
    );
    if (account) {
      setSessionUser(account);
      setIsAuthenticated(true);
      setLoginError("");
      return;
    }
    setLoginError("Wrong email or password.");
  };

  return (
    <div className="stage">
      <PhoneFrame>
        <div className="app">
          {isAuthenticated ? (
            <>
              <TopBar title="Valetudo" withDay={tab === "food"}>
                {tab === "food" ? <DaySelector selectedDate={selectedDate} onChangeDate={handleDateChange} /> : null}
              </TopBar>

              <main className={`content ${tab === "food" ? "foodContent" : ""}`}>
                {tab === "home" && <HomeScreen posts={posts} onLogout={handleLogout} currentUser={sessionUser} />}
                {tab === "food" && <FoodScreen meals={meals} />}
                {tab === "workouts" && <WorkoutsScreen />}
              </main>

              {isHomeTab ? (
                <button className="fab" onClick={() => setSheetOpen(true)} aria-label="Create post">
                  +
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
        ) : isAuthenticated ? (
          <FoodAddSheet
            open={sheetOpen}
            onClose={() => setSheetOpen(false)}
            mode={mode}
            onCreateFood={handleCreateFood}
            customFoods={customFoods}
            onToggleFavorite={handleToggleFavorite}
            onAddMealFromScan={handleAddMealFromScan}
          />
        ) : null}
      </PhoneFrame>
    </div>
  );
}
