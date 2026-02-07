import { useState } from "react";
import "../HomeScreen.css";

const quickActions = [
  { id: 1, label: "Log Workout", icon: "🏋️" },
  { id: 2, label: "Log Meal", icon: "🥗" },
  { id: 3, label: "Check In", icon: "✅" },
];

const workoutSets = [
  { id: 1, name: "Warm-up", status: "done" },
  { id: 2, name: "Set 1", status: "done" },
  { id: 3, name: "Set 2", status: "current" },
  { id: 4, name: "Set 3", status: "pending" },
  { id: 5, name: "Cool-down", status: "pending" },
];

const feed = [
  { id: 1, name: "Aisha", action: "Workout", text: "Squats day. Kept it clean." },
  { id: 2, name: "Marco", action: "Food", text: "Protein goal hit ✅" },
  { id: 3, name: "Priya", action: "Check-in", text: "Walked 20 mins. Small win." },
];

export default function HomeScreen() {
  const [focusedId, setFocusedId] = useState(null);
  const [replyId, setReplyId] = useState(null);
  const [pulse, setPulse] = useState({ like: null, save: null });
  const [liked, setLiked] = useState({});
  const [replyDrafts, setReplyDrafts] = useState({});
  const [repliesById, setRepliesById] = useState({});
  const [expandedReplies, setExpandedReplies] = useState({});

  const focusCard = (id) => setFocusedId((prev) => (prev === id ? null : id));
  const clearFocus = () => {
    setFocusedId(null);
    setReplyId(null);
  };

  const triggerPulse = (type, id) => {
    setPulse((p) => ({ ...p, [type]: id }));
    setTimeout(() => {
      setPulse((p) => (p[type] === id ? { ...p, [type]: null } : p));
    }, 450);
  };

  const toggleLike = (id) => {
    setLiked((prev) => ({ ...prev, [id]: !prev[id] }));
    triggerPulse("like", id);
  };

  const sendReply = (id) => {
    const text = (replyDrafts[id] || "").trim();
    if (!text) return;
    setRepliesById((prev) => ({
      ...prev,
      [id]: [...(prev[id] || []), text],
    }));
    setReplyDrafts((prev) => ({ ...prev, [id]: "" }));
    setReplyId(null);
  };

  const steps = { current: 10500, goal: 10000 };
  const stepsComplete = steps.current >= steps.goal;
  const workoutStatus = "in_progress"; // in_progress | complete

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

      <div className="heroCard calendarCard">
        <div className="calendarHeader">
          <div>
            <div className="heroLabel">Weekly Progress</div>
            <div className="calendarTitle">This Week</div>
          </div>
          <div className="calendarLegend">
            <span className="legendItem">
              <span className="legendDot green" /> Complete
            </span>
            <span className="legendItem">
              <span className="legendDot yellow" /> Partial
            </span>
            <span className="legendItem">
              <span className="legendDot red" /> Lacking
            </span>
          </div>
        </div>

        <div className="calendarGrid weekly" aria-label="Weekly progress calendar">
          {[
            { label: "Mon", status: "green" },
            { label: "Tue", status: "yellow" },
            { label: "Wed", status: "red" },
            { label: "Thu", status: "green" },
            { label: "Fri", status: "yellow" },
            { label: "Sat", status: "green" },
            { label: "Sun", status: "yellow" },
          ].map((d, i) => (
            <div key={`day-${i}`} className={`dayCell ${d.status}`} aria-label={d.label}>
              <span className="dayNum">{d.label}</span>
            </div>
          ))}
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
        <div className={`card simple focusCard ${stepsComplete ? "done" : "pending"}`}>
          <div className="cardTop">
            <div className="cardName">Steps</div>
            <span className={`pill ${stepsComplete ? "pillComplete" : "pillPending"}`}>
              {stepsComplete ? "Complete" : "In progress"}
            </span>
          </div>
          <div className="cardText">
            {steps.current.toLocaleString()} / {steps.goal.toLocaleString()} steps
          </div>
        </div>

        <div className="card simple focusCard">
          <div className="cardTop">
            <div className="cardName">Workout</div>
            <span className={`pill ${workoutStatus === "complete" ? "pillComplete" : "pillPending"}`}>
              {workoutStatus === "complete" ? "Complete" : "In progress"}
            </span>
          </div>
          {workoutStatus === "complete" ? (
            <div className="cardText workoutCongrats">Nice work — workout finished.</div>
          ) : (
            <>
              <div className="cardText workoutMeta">Current: Set 2</div>
              <div className="setList">
                {workoutSets.map((set) => (
                  <div key={set.id} className={`setRow ${set.status}`}>
                    <span className="setDot" />
                    <span className="setName">{set.name}</span>
                    {set.status === "current" && <span className="setNow">now</span>}
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </div>

      <div className="sectionTitle">Friends</div>
      <div className="cardList">
        {focusedId && <div className="feedBackdrop" onClick={clearFocus} />}
        {feed.map((p) => (
          <div
            key={p.id}
            className={`card feedCard ${focusedId === p.id ? "focused" : ""}`}
            onClick={() => focusCard(p.id)}
          >
            <div className="avatar">{p.name[0]}</div>

            <div className="cardMain">
              <div className="cardTop">
                <div className="cardName">{p.name}</div>
                <span className="pill">{p.action}</span>
              </div>
              <div className="cardText">{p.text}</div>

              {focusedId === p.id && (
                <div className="focusActions" onClick={(e) => e.stopPropagation()}>
                  <button
                    className={`focusBtn iconBtn ${pulse.like === p.id ? "pulse" : ""} ${
                      liked[p.id] ? "liked" : ""
                    }`}
                    aria-label="Like"
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleLike(p.id);
                    }}
                  >
                    <svg viewBox="0 0 24 24" aria-hidden="true">
                      <path
                        d="M12 20s-7-4.35-7-9.2C5 7 6.9 5 9.3 5c1.6 0 2.7.9 2.7.9S13.1 5 14.7 5C17.1 5 19 7 19 10.8 19 15.65 12 20 12 20z"
                        fill={liked[p.id] ? "currentColor" : "none"}
                        stroke="currentColor"
                        strokeWidth="1.8"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </button>
                  <button
                    className="focusBtn iconBtn"
                    aria-label="Reply"
                    onClick={(e) => {
                      e.stopPropagation();
                      setReplyId((prev) => (prev === p.id ? null : p.id));
                    }}
                  >
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
                  <button
                    className={`focusBtn iconBtn ${pulse.save === p.id ? "pulse" : ""}`}
                    aria-label="Save"
                    onClick={(e) => {
                      e.stopPropagation();
                      triggerPulse("save", p.id);
                    }}
                  >
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
                </div>
              )}
              {replyId === p.id && (
                <div className="replyBox" onClick={(e) => e.stopPropagation()}>
                  <input
                    className="replyInput"
                    placeholder="Write a reply..."
                    value={replyDrafts[p.id] || ""}
                    onChange={(e) =>
                      setReplyDrafts((prev) => ({ ...prev, [p.id]: e.target.value }))
                    }
                  />
                  <button className="replySend" onClick={() => sendReply(p.id)}>
                    Send
                  </button>
                </div>
              )}
              {repliesById[p.id]?.length > 0 && (
                <div className="replyList">
                  {(expandedReplies[p.id]
                    ? repliesById[p.id]
                    : repliesById[p.id].slice(0, 1)
                  ).map((text, idx) => (
                    <div key={`${p.id}-reply-${idx}`} className="replyItem">
                      <span className="replyAuthor">You</span>
                      <span className="replyText">{text}</span>
                    </div>
                  ))}
                  {repliesById[p.id].length > 1 && (
                    <button
                      className="replyToggle"
                      onClick={(e) => {
                        e.stopPropagation();
                        setExpandedReplies((prev) => ({
                          ...prev,
                          [p.id]: !prev[p.id],
                        }));
                      }}
                    >
                      {expandedReplies[p.id] ? "Hide replies" : "View more replies"}
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
