import { useState } from "react";

export default function AddSheet({ open, onClose, mode, onCreateFood, customFoods }) {
  const [foodView, setFoodView] = useState("root"); // root | add-meal
  const [mealTab, setMealTab] = useState("all"); // all | favorites | custom
  const [showCustomForm, setShowCustomForm] = useState(false);
  const [foodName, setFoodName] = useState("");
  const [servings, setServings] = useState("");
  const [caloriesPerServing, setCaloriesPerServing] = useState("");

  if (!open) return null;

  const handleClose = () => {
    setFoodView("root");
    setMealTab("all");
    setShowCustomForm(false);
    setFoodName("");
    setServings("");
    setCaloriesPerServing("");
    onClose();
  };

  const handleCreateFood = () => {
    const cleanName = foodName.trim();
    const servingsNum = Number(servings);
    const caloriesNum = Number(caloriesPerServing);

    if (!cleanName || Number.isNaN(servingsNum) || Number.isNaN(caloriesNum) || servingsNum <= 0 || caloriesNum <= 0) {
      return;
    }

    onCreateFood?.({
      name: cleanName,
      servings: servingsNum,
      calories: Math.round(servingsNum * caloriesNum),
      protein: 0,
      carbs: 0,
      fat: 0,
      detail: `${servingsNum} serving${servingsNum === 1 ? "" : "s"} • ${caloriesNum} kcal/serving`,
    });

    setFoodName("");
    setServings("");
    setCaloriesPerServing("");
    setShowCustomForm(false);
  };

  return (
    <div className={`sheetBackdrop ${mode === "food" && foodView === "add-meal" ? "foodPageBackdrop" : ""}`} onClick={handleClose} role="presentation">
      <div
        className={`sheet ${mode === "food" && foodView === "add-meal" ? "foodAddPage" : ""}`}
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
      >
        <div className="sheetHandle" />
        <div className="sheetHeader">
          <div className="sheetTitle">{mode === "food" && foodView === "add-meal" ? "" : `Add ${mode === "food" ? "food" : "workout"}`}</div>
          <button className="xBtn" onClick={handleClose} aria-label="Close">
            ✕
          </button>
        </div>

        {mode === "food" ? (
          <>
            {foodView === "root" ? (
              <div className="sheetActions">
                <button className="sheetAction" onClick={() => setFoodView("add-meal")}>
                  <span className="sheetActionIcon">🍽️</span>
                  Add meal
                </button>
                <button className="sheetAction">
                  <span className="sheetActionIcon">▮▯▮</span>
                  Scan barcode
                </button>
                <button className="sheetAction">
                  <span className="sheetActionIcon">📷</span>
                  Photo Log
                </button>
              </div>
            ) : (
              <div className="foodAddBody">
                <div className="mealTabs" role="tablist" aria-label="Meal categories">
                  <button
                    className={`mealTab ${mealTab === "all" ? "active" : ""}`}
                    onClick={() => setMealTab("all")}
                    role="tab"
                    aria-selected={mealTab === "all"}
                    type="button"
                  >
                    All meals
                  </button>
                  <button
                    className={`mealTab ${mealTab === "favorites" ? "active" : ""}`}
                    onClick={() => setMealTab("favorites")}
                    role="tab"
                    aria-selected={mealTab === "favorites"}
                    type="button"
                  >
                    Favorite meals
                  </button>
                  <button
                    className={`mealTab ${mealTab === "custom" ? "active" : ""}`}
                    onClick={() => setMealTab("custom")}
                    role="tab"
                    aria-selected={mealTab === "custom"}
                    type="button"
                  >
                    Custom meal
                  </button>
                </div>

                <div className="mealTabPanel" role="tabpanel">
                  {mealTab === "all" && (
                    <div className="sheetOption">
                      <div className="sheetOptionTitle">All meals</div>
                      <div className="sheetOptionSub">Browse the full database</div>
                    </div>
                  )}
                  {mealTab === "favorites" && (
                    <div className="sheetOption">
                      <div className="sheetOptionTitle">Favorite meals</div>
                      <div className="sheetOptionSub">Your saved go-to meals</div>
                    </div>
                  )}
                  {mealTab === "custom" && (
                    <div className="customStack">
                      {!showCustomForm ? (
                        <div className="customHeader">
                          <button className="smallBtn" onClick={() => setShowCustomForm(true)}>
                            Create food
                          </button>
                        </div>
                      ) : (
                        <div className="customHeader backOnly">
                          <button className="backBtn" onClick={() => setShowCustomForm(false)} aria-label="Back">
                            ←
                          </button>
                        </div>
                      )}

                      {!showCustomForm ? (
                        <div className="customList">
                          <div className="sheetOptionTitle">Custom foods</div>
                          {customFoods && customFoods.length > 0 ? (
                            customFoods.map((food) => (
                              <div key={food.id} className="sheetOption">
                                <div className="sheetOptionTitle">{food.name}</div>
                                <div className="sheetOptionSub">{food.detail}</div>
                              </div>
                            ))
                          ) : (
                            <div className="sheetOption">
                              <div className="sheetOptionSub">No custom foods yet.</div>
                            </div>
                          )}
                        </div>
                      ) : (
                        <div className="customMealForm">
                          <div className="sheetOptionTitle">Create a food</div>
                          <div className="sheetOptionSub">Build your own meal item.</div>
                          <input
                            className="input"
                            placeholder="Food name (e.g., Turkey sandwich)"
                            value={foodName}
                            onChange={(e) => setFoodName(e.target.value)}
                          />
                          <div className="row">
                            <input
                              className="input"
                              placeholder="Servings"
                              inputMode="decimal"
                              value={servings}
                              onChange={(e) => setServings(e.target.value)}
                            />
                            <input
                              className="input"
                              placeholder="Calories per serving"
                              inputMode="decimal"
                              value={caloriesPerServing}
                              onChange={(e) => setCaloriesPerServing(e.target.value)}
                            />
                          </div>
                          <button className="primaryBtn" onClick={handleCreateFood}>
                            Create food
                          </button>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            )}
          </>
        ) : (
          <>
            <input className="input" placeholder="Workout name (e.g., Push Day)" />
            <input className="input" placeholder="Notes (optional)" />
            <button className="primaryBtn">Save workout</button>
          </>
        )}
      </div>
    </div>
  );
}
