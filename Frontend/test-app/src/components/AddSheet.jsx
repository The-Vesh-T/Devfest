import { useState } from "react";

export default function AddSheet({ open, onClose, mode }) {
  const [foodView, setFoodView] = useState("root"); // root | add-meal
  const [mealTab, setMealTab] = useState("all"); // all | favorites | custom

  if (!open) return null;

  const handleClose = () => {
    setFoodView("root");
    setMealTab("all");
    onClose();
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
                    <div className="sheetOption">
                      <div className="sheetOptionTitle">Custom meal</div>
                      <div className="sheetOptionSub">Create a meal from scratch</div>
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
