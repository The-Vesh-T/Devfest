export default function FoodScreen() {
  return (
    <div className="screenBody">
      <h2 className="screenTitle">Food</h2>

      <div className="summaryRow">
        <div className="miniStat">
          <div className="miniNum">1,280</div>
          <div className="miniLabel">kcal</div>
        </div>
        <div className="miniStat">
          <div className="miniNum">92g</div>
          <div className="miniLabel">protein</div>
        </div>
        <div className="miniStat">
          <div className="miniNum">140g</div>
          <div className="miniLabel">carbs</div>
        </div>
        <div className="miniStat">
          <div className="miniNum">42g</div>
          <div className="miniLabel">fat</div>
        </div>
      </div>

      <div className="cardList">
        <div className="card simple">
          <div className="cardTop">
            <div className="cardName">Lunch</div>
            <span className="pill">400 kcal</span>
          </div>
          <div className="cardText">Chicken bowl • rice • veggies</div>
        </div>

        <div className="card simple">
          <div className="cardTop">
            <div className="cardName">Snack</div>
            <span className="pill">220 kcal</span>
          </div>
          <div className="cardText">Greek yogurt • honey</div>
        </div>
      </div>

      <div className="hint">Tap <b>+</b> to add food.</div>
    </div>
  );
}
