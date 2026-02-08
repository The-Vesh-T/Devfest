import { useState } from "react";
import "./FoodScreen.css";

export default function FoodScreen({ meals, onEditMeal, onDeleteMeal }) {
  const safeMeals = Array.isArray(meals) ? meals : [];
  const toNumber = (value) => {
    const n = Number(value);
    return Number.isFinite(n) ? n : 0;
  };
  const toIntString = (value) => `${Math.max(0, Math.round(toNumber(value)))}`;
  const calories = safeMeals.reduce((sum, meal) => sum + toNumber(meal?.calories), 0);
  const goal = 1800;
  const remaining = Math.max(goal - calories, 0);
  const overBy = Math.max(calories - goal, 0);
  const isOverGoal = overBy > 0;
  const pct = Math.max(0, Math.min(calories / goal, 1));
  const radius = 54;
  const circumference = 2 * Math.PI * radius;
  const dashOffset = circumference * (1 - pct);
  const [editingMeal, setEditingMeal] = useState(null);
  const [editName, setEditName] = useState("");
  const [editDetail, setEditDetail] = useState("");
  const [editCalories, setEditCalories] = useState("");
  const [editProtein, setEditProtein] = useState("");
  const [editCarbs, setEditCarbs] = useState("");
  const [editFat, setEditFat] = useState("");

  const openEditor = (meal) => {
    if (!meal?.id) return;
    setEditingMeal(meal);
    setEditName(meal.name || "");
    setEditDetail(meal.detail || "");
    setEditCalories(toIntString(meal.calories));
    setEditProtein(toIntString(meal.protein));
    setEditCarbs(toIntString(meal.carbs));
    setEditFat(toIntString(meal.fat));
  };

  const closeEditor = () => {
    setEditingMeal(null);
    setEditName("");
    setEditDetail("");
    setEditCalories("");
    setEditProtein("");
    setEditCarbs("");
    setEditFat("");
  };

  const handleSaveMeal = async () => {
    if (!editingMeal?.id) return;
    await onEditMeal?.(editingMeal.id, {
      name: editName.trim() || "Meal",
      detail: editDetail.trim(),
      calories: Number(editCalories) || 0,
      protein: Number(editProtein) || 0,
      carbs: Number(editCarbs) || 0,
      fat: Number(editFat) || 0,
    });
    closeEditor();
  };

  const handleDeleteMeal = async () => {
    if (!editingMeal?.id) return;
    await onDeleteMeal?.(editingMeal.id);
    closeEditor();
  };

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
          <div
            key={meal?.id ?? `meal_${idx}`}
            className="card simple mealCard"
            role="button"
            tabIndex={0}
            onClick={() => openEditor(meal)}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                openEditor(meal);
              }
            }}
          >
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

      {editingMeal ? (
        <div className="mealEditBackdrop" onClick={closeEditor} role="presentation">
          <div className="mealEditCard" onClick={(e) => e.stopPropagation()} role="dialog" aria-modal="true">
            <div className="mealEditHeader">
              <div className="mealEditTitle">Edit meal</div>
              <button className="xBtn" onClick={closeEditor} aria-label="Close">
                ✕
              </button>
            </div>

            <div className="mealEditForm">
              <label className="mealEditField mealEditFieldFull">
                <span className="mealEditLabel">Meal name</span>
                <input
                  className="input"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  placeholder="Meal name"
                />
              </label>
              <label className="mealEditField mealEditFieldFull">
                <span className="mealEditLabel">Meal details</span>
                <input
                  className="input"
                  value={editDetail}
                  onChange={(e) => setEditDetail(e.target.value)}
                  placeholder="Details"
                />
              </label>
            <div className="row mealEditMacroRow">
              <label className="mealEditField">
                <span className="mealEditLabel">Calories (kcal)</span>
                <input
                  className="input"
                  value={editCalories}
                  onChange={(e) => setEditCalories(e.target.value.replace(/\D/g, ""))}
                  placeholder="0"
                  inputMode="numeric"
                />
              </label>
              <label className="mealEditField">
                <span className="mealEditLabel">Protein (g)</span>
                <input
                  className="input"
                  value={editProtein}
                  onChange={(e) => setEditProtein(e.target.value.replace(/\D/g, ""))}
                  placeholder="0"
                  inputMode="numeric"
                />
              </label>
            </div>
            <div className="row mealEditMacroRow">
              <label className="mealEditField">
                <span className="mealEditLabel">Carbs (g)</span>
                <input
                  className="input"
                  value={editCarbs}
                  onChange={(e) => setEditCarbs(e.target.value.replace(/\D/g, ""))}
                  placeholder="0"
                  inputMode="numeric"
                />
              </label>
              <label className="mealEditField">
                <span className="mealEditLabel">Fat (g)</span>
                <input
                  className="input"
                  value={editFat}
                  onChange={(e) => setEditFat(e.target.value.replace(/\D/g, ""))}
                  placeholder="0"
                  inputMode="numeric"
                />
              </label>
            </div>
            </div>

            <div className="mealEditActions">
              <button className="primaryBtn mealDeleteBtn" onClick={handleDeleteMeal}>
                Delete
              </button>
              <button className="primaryBtn" onClick={handleSaveMeal}>
                Save changes
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
