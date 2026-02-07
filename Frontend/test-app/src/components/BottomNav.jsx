export default function BottomNav({ tab, setTab }) {
  return (
    <nav className="bottomNav" role="navigation" aria-label="Primary">
      <button
        className={`navItem ${tab === "home" ? "active" : ""}`}
        onClick={() => setTab("home")}
      >
        <div className="navIcon">⌂</div>
        <div className="navLabel">Home</div>
      </button>

      <button
        className={`navItem ${tab === "food" ? "active" : ""}`}
        onClick={() => setTab("food")}
      >
        <div className="navIcon">🍽️</div>
        <div className="navLabel">Food</div>
      </button>

      <button
        className={`navItem ${tab === "workouts" ? "active" : ""}`}
        onClick={() => setTab("workouts")}
      >
        <div className="navIcon">🏋️</div>
        <div className="navLabel">Workouts</div>
      </button>
    </nav>
  );
}
