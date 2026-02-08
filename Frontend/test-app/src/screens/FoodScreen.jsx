import "./FoodScreen.css";

export default function FoodScreen({ meals }) {
  const safeMeals = Array.isArray(meals) ? meals : [];
  const toNumber = (value) => {
    const n = Number(value);
    return Number.isFinite(n) ? n : 0;
  };
  const calories = safeMeals.reduce((sum, meal) => sum + toNumber(meal?.calories), 0);
  const goal = 1800;
  const remaining = Math.max(goal - calories, 0);
  const overBy = Math.max(calories - goal, 0);
  const isOverGoal = overBy > 0;
  const pct = Math.max(0, Math.min(calories / goal, 1));
  const radius = 54;
  const circumference = 2 * Math.PI * radius;
  const dashOffset = circumference * (1 - pct);

  return (
    <div className="screenBody foodScreenBody">
      <div className={`calRing ${isOverGoal ? "overLimit" : ""}`}>
        <svg
          className="calRingSvg"
          viewBox="0 0 140 140"
          role="img"
          aria-label={`${calories} calories eaten${isOverGoal ? `, ${overBy} over goal` : ""}`}
        >
          <circle className="calRingTrack" cx="70" cy="70" r={radius} />
          <circle
            className="calRingProgress"
            cx="70"
            cy="70"
            r={radius}
            strokeDasharray={circumference}
            strokeDashoffset={dashOffset}
          />
        </svg>
        <div className="calRingCenter">
          <div className="calRingNum">{calories.toLocaleString()}</div>
          <div className="calRingLabel">kcal eaten</div>
          <div className="calRingSub">
            {isOverGoal ? `${overBy.toLocaleString()} kcal over` : `${remaining.toLocaleString()} kcal left`}
          </div>
        </div>
      </div>

      <div className="summaryRow">
        <div className="miniStat kcal">
          <div className="miniNum">1,280</div>
          <div className="miniLabel">kcal</div>
        </div>
        <div className="miniStat protein">
          <div className="miniNum">92g</div>
          <div className="miniLabel">protein</div>
        </div>
        <div className="miniStat carbs">
          <div className="miniNum">140g</div>
          <div className="miniLabel">carbs</div>
        </div>
        <div className="miniStat fat">
          <div className="miniNum">42g</div>
          <div className="miniLabel">fat</div>
        </div>
      </div>

      <div className="cardList">
        {safeMeals.map((meal, idx) => (
          <div key={meal?.id ?? `meal_${idx}`} className="card simple">
            <div className="cardTop">
              <div className="cardName">{meal?.name || "Meal"}</div>
              <span className="pill">{toNumber(meal?.calories)} kcal</span>
            </div>
            <div className="cardText">{meal?.detail || ""}</div>
            <div className="mealMacros">
              <div className="mealMacro protein">
                <div className="mealMacroNum">{toNumber(meal?.protein)}g</div>
                <div className="mealMacroLabel">protein</div>
              </div>
              <div className="mealMacro carbs">
                <div className="mealMacroNum">{toNumber(meal?.carbs)}g</div>
                <div className="mealMacroLabel">carbs</div>
              </div>
              <div className="mealMacro fat">
                <div className="mealMacroNum">{toNumber(meal?.fat)}g</div>
                <div className="mealMacroLabel">fat</div>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="hint">Tap <b>+</b> to add food.</div>
    </div>
  );
}
