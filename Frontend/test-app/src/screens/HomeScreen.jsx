import { useEffect, useState } from "react";
import "../HomeScreen.css";

const quickActions = [
  { id: 1, label: "Log Workout", icon: "🏋️" },
  { id: 2, label: "Log Meal", icon: "🥗" },
  { id: 3, label: "Check In", icon: "✅" },
];

const todayFocus = [
  { id: 1, title: "Lower Body", meta: "45 min • Strength", detail: "Squat • RDL • Lunges" },
  { id: 2, title: "Steps", meta: "6,200 / 10,000", detail: "Easy walk after lunch" },
];

const feed = [
  { id: 1, name: "Aisha", action: "Workout", text: "Squats day. Kept it clean." },
  { id: 2, name: "Marco", action: "Food", text: "Protein goal hit ✅" },
  { id: 3, name: "Priya", action: "Check-in", text: "Walked 20 mins. Small win." },
];

export default function HomeScreen() {
  const [showPercent, setShowPercent] = useState(true);
  const [focusedId, setFocusedId] = useState(null);

  useEffect(() => {
    const id = setInterval(() => {
      setShowPercent((s) => !s);
    }, 2200);
    return () => clearInterval(id);
  }, []);

  const focusCard = (id) => setFocusedId(id);
  const clearFocus = () => setFocusedId(null);

  return (
    <div className="screenBody">
      <div className="homeHeader">
        <div>
          <div className="homeKicker">Good morning</div>
          <h2 className="screenTitle homeTitle">Aisha</h2>
        </div>
        <div className="streakBadge">
          <div className="streakNum">12</div>
          <div className="streakLabel">day streak</div>
        </div>
      </div>

      <div className="heroCard">
        <div className="heroTop">
          <div>
            <div className="heroLabel">Today</div>
            <div className="heroValue">1,640 kcal</div>
            <div className="heroSub">72g protein • 6.2k steps</div>
          </div>
          <div className="progressRing" aria-label="Daily goal progress">
            <div className="progressInner">
              <div className="progressValue">
                {showPercent ? "68%" : "520"}
              </div>
              <div className="progressLabel">
                {showPercent ? "goal" : "kcal left"}
              </div>
            </div>
          </div>
        </div>

        <div className="heroGrid">
          <div className="heroStat">
            <div className="heroStatNum">45</div>
            <div className="heroStatLabel">mins trained</div>
          </div>
          <div className="heroStat">
            <div className="heroStatNum">7.8h</div>
            <div className="heroStatLabel">sleep</div>
          </div>
          <div className="heroStat">
            <div className="heroStatNum">3</div>
            <div className="heroStatLabel">friends active</div>
          </div>
        </div>
      </div>

      <div className="quickActions">
        {quickActions.map((a) => (
          <button key={a.id} className="quickAction">
            <span className="quickIcon">{a.icon}</span>
            <span className="quickLabel">{a.label}</span>
          </button>
        ))}
      </div>

      <div className="sectionTitle">Today’s focus</div>
      <div className="cardList">
        {todayFocus.map((item) => (
          <div key={item.id} className="card simple focusCard">
            <div className="cardTop">
              <div className="cardName">{item.title}</div>
              <span className="pill">{item.meta}</span>
            </div>
            <div className="cardText">{item.detail}</div>
          </div>
        ))}
      </div>

      <div className="sectionTitle">Friends</div>
      <div className="cardList">
        {feed.map((p) => (
          <div
            key={p.id}
            className={`card feedCard ${focusedId === p.id ? "focused" : ""}`}
            onContextMenu={(e) => {
              e.preventDefault();
              focusCard(p.id);
            }}
            onPointerDown={(e) => {
              if (e.pointerType === "mouse" && e.button !== 0) return;
              const t = setTimeout(() => focusCard(p.id), 420);
              const cancel = () => {
                clearTimeout(t);
                window.removeEventListener("pointerup", cancel);
                window.removeEventListener("pointercancel", cancel);
                window.removeEventListener("pointermove", cancel);
              };
              window.addEventListener("pointerup", cancel, { once: true });
              window.addEventListener("pointercancel", cancel, { once: true });
              window.addEventListener("pointermove", cancel, { once: true });
            }}
          >
            <div className="avatar">{p.name[0]}</div>

            <div className="cardMain">
              <div className="cardTop">
                <div className="cardName">{p.name}</div>
                <span className="pill">{p.action}</span>
              </div>
              <div className="cardText">{p.text}</div>

              {focusedId === p.id && (
                <div className="focusActions">
                  <button className="focusBtn iconBtn" aria-label="Like">
                    <svg viewBox="0 0 24 24" aria-hidden="true">
                      <path
                        d="M12 20s-7-4.35-7-9.2C5 7 6.9 5 9.3 5c1.6 0 2.7.9 2.7.9S13.1 5 14.7 5C17.1 5 19 7 19 10.8 19 15.65 12 20 12 20z"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="1.8"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </button>
                  <button className="focusBtn iconBtn" aria-label="Reply">
                    <svg viewBox="0 0 24 24" aria-hidden="true">
                      <path
                        d="M4 6h16a2 2 0 0 1 2 2v7a2 2 0 0 1-2 2H9l-5 4v-4H6a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2z"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="1.8"
                        strokeLinejoin="round"
                        strokeLinecap="round"
                      />
                    </svg>
                  </button>
                  <button className="focusBtn iconBtn" aria-label="Download">
                    <svg viewBox="0 0 24 24" aria-hidden="true">
                      <path
                        d="M12 4v10m0 0 4-4m-4 4-4-4M5 19h14"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="1.8"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </button>
                  <button className="focusBtn ghost" onClick={clearFocus}>
                    Close
                  </button>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
