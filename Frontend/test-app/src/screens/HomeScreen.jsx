const feed = [
  { id: 1, name: "Aisha", action: "Workout", text: "Squats day. Kept it clean." },
  { id: 2, name: "Marco", action: "Food", text: "Protein goal hit ✅" },
  { id: 3, name: "Priya", action: "Check-in", text: "Walked 20 mins. Small win." },
];

export default function HomeScreen() {
  return (
    <div className="screenBody">
      <h2 className="screenTitle">Friends</h2>
      <div className="cardList">
        {feed.map((p) => (
          <div key={p.id} className="card">
            <div className="avatar">{p.name[0]}</div>

            <div className="cardMain">
              <div className="cardTop">
                <div className="cardName">{p.name}</div>
                <span className="pill">{p.action}</span>
              </div>
              <div className="cardText">{p.text}</div>

              <div className="cardActions">
                <button className="miniBtn">👏</button>
                <button className="miniBtn">💬</button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
