export default function WorkoutsScreen() {
  return (
    <div className="screenBody">
      <h2 className="screenTitle">Workouts</h2>

      <div className="cardList">
        <div className="card simple">
          <div className="cardTop">
            <div className="cardName">Lower Body</div>
            <span className="pill">45 min</span>
          </div>
          <div className="cardText">Squat • RDL • Lunges</div>
        </div>

        <div className="card simple">
          <div className="cardTop">
            <div className="cardName">Upper Body</div>
            <span className="pill">35 min</span>
          </div>
          <div className="cardText">Bench • Rows • Curls</div>
        </div>
      </div>

      <div className="hint">Tap <b>+</b> to add a workout.</div>
    </div>
  );
}
