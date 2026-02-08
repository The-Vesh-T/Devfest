export default function BottomNav({ tab, setTab }) {
  return (
    <nav className="bottomNav" role="navigation" aria-label="Primary">
      <button
        className={`navItem ${tab === "home" ? "active" : ""}`}
        onClick={() => setTab("home")}
      >
        <div className="navIcon navIconSvg" aria-hidden="true">
          <svg viewBox="0 0 24 24">
            <path
              d="M4.5 10.8 12 5l7.5 5.8V19a1 1 0 0 1-1 1h-5.1v-5h-2.8v5H5.5a1 1 0 0 1-1-1v-8.2Z"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.9"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </div>
        <div className="navLabel">Home</div>
      </button>

      <button
        className={`navItem ${tab === "food" ? "active" : ""}`}
        onClick={() => setTab("food")}
      >
        <div className="navIcon navIconSvg" aria-hidden="true">
          <svg viewBox="0 0 24 24">
            <path
              d="M7.2 5.4v5.1M9.2 5.4v5.1M6.2 7.9h4"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.9"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              d="M8.2 10.5v8.1M15.9 5.4c1.5 1.9 1.6 4.9.2 6.9l-1.2 1.7v4.6"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.9"
              strokeLinecap="round"
            />
          </svg>
        </div>
        <div className="navLabel">Food</div>
      </button>

      <button
        className={`navItem ${tab === "workouts" ? "active" : ""}`}
        onClick={() => setTab("workouts")}
      >
        <div className="navIcon navIconSvg" aria-hidden="true">
          <svg viewBox="0 0 24 24">
            <path
              d="M7.6 9.7v4.6M5.7 8.5v7M18.3 8.5v7M16.4 9.7v4.6M7.6 12h8.8"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.1"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </div>
        <div className="navLabel">Workouts</div>
      </button>
    </nav>
  );
}
