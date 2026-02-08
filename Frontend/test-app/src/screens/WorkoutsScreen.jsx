import { useEffect, useState } from "react";
import "./WorkoutsScreen.css";
import { isSupabaseConfigured } from "../lib/supabase";
import {
  addWorkoutSessionWithSets,
  createWorkoutRoutine,
  deleteWorkoutRoutine,
  listLastExerciseSets,
  listWorkoutRoutines,
} from "../lib/workoutRepo";

const MOCK_ROUTINES = [
  { id: "r1", title: "Lower Body", meta: "5 exercises • ~45 min", description: "Quads, hamstrings, glutes", exercises: ["Squats", "Leg Press", "Leg Curl", "Lunges", "Calf Raises"] },
  { id: "r2", title: "Upper Body", meta: "6 exercises • ~35 min", description: "Chest, back, shoulders", exercises: ["Bench Press", "Rows", "Pull-ups", "Shoulder Press", "Lateral Raises", "Face Pulls"] },
  { id: "r3", title: "Push", meta: "4 exercises • ~30 min", description: "Chest and triceps focus", exercises: ["Incline Bench", "Dips", "Push-ups", "Tricep Extension"] },
];

const DISCOVER_WORKOUTS = [
  {
    id: "d1",
    title: "Full Body",
    difficulty: "Beginner",
    duration: "40 min",
    exercises: 8,
    exampleMoves: ["Squat", "Push-ups", "Deadlift"]
  },
  {
    id: "d2",
    title: "HIIT Cardio",
    difficulty: "Advanced",
    duration: "20 min",
    exercises: 6,
    exampleMoves: ["Burpees", "Mountain Climbers", "Sprint"]
  },
  {
    id: "d3",
    title: "Legs & Glutes",
    difficulty: "Intermediate",
    duration: "50 min",
    exercises: 7,
    exampleMoves: ["Goblet Squat", "Lunge", "Hip Thrust"]
  },
  {
    id: "d4",
    title: "Core & Abs",
    difficulty: "Beginner",
    duration: "25 min",
    exercises: 5,
    exampleMoves: ["Plank", "Dead Bug", "Bicycle Crunch"]
  },
  {
    id: "d5",
    title: "Back & Biceps",
    difficulty: "Intermediate",
    duration: "45 min",
    exercises: 6,
    exampleMoves: ["Pull-up", "Barbell Row", "Hammer Curl"]
  },
  {
    id: "d6",
    title: "Mobility & Stretch",
    difficulty: "Beginner",
    duration: "30 min",
    exercises: 10,
    exampleMoves: ["Hip Opener", "Cat-Cow", "Shoulder Pass-Through"]
  },
];

const ROUTINES_STORAGE_KEY = "workouts_routines_v1";
const LAST_SETS_STORAGE_KEY = "workouts_last_sets_v1";

function loadSavedRoutines() {
  if (typeof window === "undefined") return MOCK_ROUTINES;
  try {
    const raw = window.localStorage.getItem(ROUTINES_STORAGE_KEY);
    if (!raw) return MOCK_ROUTINES;
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : MOCK_ROUTINES;
  } catch {
    return MOCK_ROUTINES;
  }
}

function saveRoutines(routines) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(ROUTINES_STORAGE_KEY, JSON.stringify(routines));
}

function loadLastSets() {
  if (typeof window === "undefined") return {};
  try {
    const raw = window.localStorage.getItem(LAST_SETS_STORAGE_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw);
    return parsed && typeof parsed === "object" ? parsed : {};
  } catch {
    return {};
  }
}

function saveLastSets(lastSets) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(LAST_SETS_STORAGE_KEY, JSON.stringify(lastSets));
}

function normalizeTitle(title) {
  return title.trim().toLowerCase();
}

function makeExercise(name) {
  return {
    id: `ex_${Date.now()}_${Math.random().toString(16).slice(2)}`,
    name,
    sets: [],
  };
}

const MAX_SETS_PER_EXERCISE = 10;

function makeSet() {
  return {
    id: `set_${Date.now()}_${Math.random().toString(16).slice(2)}`,
    weight: "",
    reps: "",
    failure: false,
    dropset: false,
  };
}

function sanitizeNumberInput(raw, { allowDecimal = false, maxIntegerDigits = 3, maxDecimalDigits = 0 } = {}) {
  if (raw === "" || raw == null) return "";
  let value = String(raw).replace(/-/g, "");
  value = value.replace(/[^0-9.]/g, "");
  if (!value) return "";
  if (!allowDecimal) {
    return value.replace(/\D/g, "").slice(0, maxIntegerDigits);
  }

  const [integerPart = "", ...rest] = value.split(".");
  const filteredInt = integerPart.replace(/\D/g, "").slice(0, maxIntegerDigits) || "0";
  const decimalPart = rest.join("").replace(/\D/g, "").slice(0, maxDecimalDigits);
  return decimalPart ? `${filteredInt}.${decimalPart}` : filteredInt;
}

function Section({ title, right }) {
  return (
    <div className="wkSection">
      <div className="wkSectionTop">
        <div className="wkH2">{title}</div>
        {right}
      </div>
    </div>
  );
}


function RowButton({ icon, title, subtitle, onClick }) {
  return (
    <button className="wkRowBtn" onClick={onClick}>
      <div className="wkRowIcon">{icon}</div>
      <div className="wkRowMain">
        <div className="wkRowTitle">{title}</div>
        {subtitle ? <div className="wkRowSub">{subtitle}</div> : null}
      </div>
      <div className="wkRowChevron">›</div>
    </button>
  );
}

function Tile({ icon, title, onClick }) {
  return (
    <button className="wkTile" onClick={onClick}>
      <div className="wkTileIcon">{icon}</div>
      <div className="wkTileText">{title}</div>
    </button>
  );
}

function RoutineCard({ r, onOpen, onRemove }) {
  return (
    <div
      className="wkRoutine"
      role="button"
      tabIndex={0}
      onClick={() => onOpen(r)}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onOpen(r);
        }
      }}
    >
      <div className="wkRoutineMain">
        <div className="wkRoutineTitle">{r.title}</div>
        <div className="wkRoutineMeta">{r.meta}</div>
        {r.description && <div className="wkRoutineDesc">{r.description}</div>}
        <div className="wkRoutineOpenHint">Open routine ›</div>
      </div>
      <button
        className="wkRoutineRemove"
        aria-label={`Remove ${r.title}`}
        onClick={(e) => {
          e.stopPropagation();
          onRemove(r.id);
        }}
      >
        ×
      </button>
    </div>
  );
}

function DiscoverWorkoutCard({ w, onToggle, alreadyAdded }) {
  const getDifficultyColor = (difficulty) => {
    switch(difficulty) {
      case "Beginner": return "#4ade80";
      case "Intermediate": return "#fbbf24";
      case "Advanced": return "#f87171";
      default: return "#a0aec0";
    }
  };

  const actionText = alreadyAdded ? "Remove from Routines" : "+ Add to Routines";

  return (
    <div
      className="wkDiscoverCard"
      role="button"
      tabIndex={0}
      onClick={() => onToggle(w)}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onToggle(w);
        }
      }}
    >
      <div className="wkDiscoverTop">
        <div className="wkDiscoverTitle">{w.title}</div>
        <span className="wkDiffBadge" style={{ backgroundColor: getDifficultyColor(w.difficulty) }}>
          {w.difficulty}
        </span>
      </div>
      <div className="wkDiscoverMeta">
        <span>⏱️ {w.duration}</span>
        <span>🏋️ {w.exercises} exercises</span>
      </div>
      <div className="wkDiscoverExamples">
        {w.exampleMoves.map((move) => (
          <span key={move} className="wkDiscoverExample">{move}</span>
        ))}
      </div>
      <button
        className={`wkAddBtn ${alreadyAdded ? "wkAddBtnRemove" : ""}`}
        onClick={(e) => {
          e.stopPropagation();
          onToggle(w);
        }}
      >
        {actionText}
      </button>
    </div>
  );
}

function WeightWarning({ weight, onCancel, onConfirm }) {
  if (!weight) return null;

  return (
    <div className="wkSheetBackdrop" role="presentation">
      <div className="wkSheet wkWarningSheet" role="dialog" aria-modal="true">
        <div className="wkWarningTitle">That is a lot of weight</div>
        <div className="wkWarningText">You entered {weight} kg. Are you sure?</div>
        <div className="wkWarningActions">
          <button className="wkWarningBtn" onClick={onCancel}>Cancel</button>
          <button className="wkWarningBtn primary" onClick={onConfirm}>Confirm</button>
        </div>
      </div>
    </div>
  );
}

function CreateRoutineSheet({ open, onClose, onCreate }) {
  const [title, setTitle] = useState("");
  const [exerciseInput, setExerciseInput] = useState("");
  const [exerciseList, setExerciseList] = useState([]);
  const canSave = title.trim().length > 0;

  const handleExerciseAdd = () => {
    const trimmed = exerciseInput.trim();
    if (!trimmed) return;
    setExerciseList((prev) => [...prev, trimmed]);
    setExerciseInput("");
  };

  const removeExercise = (idx) => {
    setExerciseList((prev) => prev.filter((_, i) => i !== idx));
  };
  if (!open) return null;

  return (
    <div className="wkSheetBackdrop" onClick={onClose} role="presentation">
      <div className="wkSheet wkCreateSheet" onClick={(e) => e.stopPropagation()} role="dialog" aria-modal="true">
        <div className="wkSheetHandle" />
        <div className="wkSheetHeader">
          <button className="wkSheetTextBtn" onClick={onClose}>Cancel</button>
          <div className="wkSheetTitle">Create Routine</div>
          <button
            className="wkSheetPrimaryBtn"
            disabled={!canSave}
            onClick={() => {
              const t = title.trim();
              if (!t) return;
              onCreate(t, exerciseList);
              setTitle("");
              setExerciseList([]);
              setExerciseInput("");
              onClose();
            }}
          >
            Save
          </button>
        </div>

        <div className="wkSheetBody">
          <div className="wkFieldLabel">Routine title</div>
          <input
            className="wkInput"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && canSave) {
                onCreate(title.trim(), exerciseList);
                setTitle("");
                setExerciseList([]);
                setExerciseInput("");
                onClose();
              }
            }}
            placeholder="e.g., Chest & Triceps"
            autoFocus
          />

          <div className="wkCreateSectionLabel">Exercises</div>
          <div className="wkExerciseInputRow">
            <input
              className="wkSetInput"
              value={exerciseInput}
              onChange={(e) => setExerciseInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleExerciseAdd()}
              placeholder="Add exercise"
            />
            <button className="wkAddExerciseBtn" type="button" onClick={handleExerciseAdd}>
              + Add
            </button>
          </div>
          {exerciseList.length === 0 ? (
            <div className="wkEmpty">
              <div className="wkEmptyText">No exercises yet</div>
            </div>
          ) : (
            <div className="wkExerciseList">
              {exerciseList.map((exercise, idx) => (
                <div key={`${exercise}-${idx}`} className="wkExerciseTag">
                  <span>{exercise}</span>
                  <button onClick={() => removeExercise(idx)}>×</button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function RoutineDetailsSheet({ routine, open, onClose, onAddToWorkout }) {
  if (!open || !routine) return null;

  return (
    <div className="wkSheetBackdrop" onClick={onClose} role="presentation">
      <div className="wkSheet wkRoutineSheet" onClick={(e) => e.stopPropagation()} role="dialog" aria-modal="true">
        <div className="wkSheetHandle" />
        <div className="wkSheetHeader">
          <button className="wkSheetTextBtn" onClick={onClose}>← Back</button>
          <div className="wkSheetTitle">{routine.title}</div>
          <div style={{ width: "60px" }}></div>
        </div>

        <div className="wkSheetBody">
          <div className="wkRoutineDetail">
            <div className="wkDetailMeta">{routine.meta}</div>
            {routine.description && <div className="wkDetailDesc">{routine.description}</div>}
            
            <div className="wkDetailExercisesHeader">Exercises ({routine.exercises?.length || 0})</div>
            <div className="wkDetailExercises">
              {routine.exercises?.map((exercise, idx) => (
                <div key={idx} className="wkDetailExerciseItem">
                  <span className="wkExerciseNum">{idx + 1}</span>
                  <span className="wkExerciseName">{exercise}</span>
                </div>
              ))}
            </div>

          </div>
        </div>
        <div className="wkSheetFooter">
          <button className="wkStartBtn" onClick={() => {
            onAddToWorkout(routine);
            onClose();
          }}>
            🚀 Start Workout
          </button>
        </div>
      </div>
    </div>
  );
}

function DiscoverWorkoutsSheet({ open, onClose, onToggle, routines }) {
  if (!open) return null;
  const existingTitles = new Set(routines.map((r) => normalizeTitle(r.title)));

  return (
    <div className="wkSheetBackdrop" onClick={onClose} role="presentation">
      <div className="wkSheet" onClick={(e) => e.stopPropagation()} role="dialog" aria-modal="true">
        <div className="wkSheetHandle" />
        <div className="wkSheetHeader">
          <button className="wkSheetTextBtn" onClick={onClose}>Close</button>
          <div className="wkSheetTitle">Discover Workouts</div>
          <div style={{ width: "60px" }}></div>
        </div>

        <div className="wkSheetBody">
          <div className="wkDiscoverGrid">
            {DISCOVER_WORKOUTS.map((w) => (
              <DiscoverWorkoutCard
                key={w.id}
                w={w}
                onToggle={onToggle}
                alreadyAdded={existingTitles.has(normalizeTitle(w.title))}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// Active Workout Screen (like Hevy's live workout)
function ActiveWorkoutScreen({ routine, lastSets, onClose, onComplete }) {
  const [exercises, setExercises] = useState(() =>
    (routine.exercises || []).map((ex) => {
      if (typeof ex === "string") return makeExercise(ex);
      if (ex && typeof ex === "object" && ex.name) {
        return { ...makeExercise(ex.name), sets: Array.isArray(ex.sets) ? ex.sets : [] };
      }
      return makeExercise("Exercise");
    })
  );
  const [newExercise, setNewExercise] = useState("");
  const [weightWarning, setWeightWarning] = useState(null);

  const handleNumericKeyDown = (e, { allowDecimal }) => {
    if (e.ctrlKey || e.metaKey || e.altKey) return;
    const allowedKeys = ["Backspace", "Delete", "ArrowLeft", "ArrowRight", "Tab", "Home", "End"];
    if (allowedKeys.includes(e.key)) return;
    if (allowDecimal && e.key === ".") return;
    if (/^\d$/.test(e.key)) return;
    e.preventDefault();
  };

  const handleNumericPaste = (e, { allowDecimal, maxIntegerDigits, maxDecimalDigits }) => {
    const pasted = e.clipboardData?.getData("text") ?? "";
    const sanitized = sanitizeNumberInput(pasted, { allowDecimal, maxIntegerDigits, maxDecimalDigits });
    if (pasted !== sanitized) {
      e.preventDefault();
      const target = e.target;
      if (target) {
        updateSetField(
          target.dataset.exerciseId,
          target.dataset.setId,
          target.dataset.field,
          sanitized
        );
      }
    }
  };

  const handleAddExercise = () => {
    if (newExercise.trim()) {
      setExercises((prev) => [...prev, makeExercise(newExercise.trim())]);
      setNewExercise("");
    }
  };

  const addSet = (exerciseId) => {
    setExercises((prev) =>
      prev.map((ex) => {
        if (ex.id !== exerciseId) return ex;
        if (ex.sets.length >= MAX_SETS_PER_EXERCISE) return ex;
        return { ...ex, sets: [...ex.sets, makeSet()] };
      })
    );
  };

  const removeExercise = (exerciseId) => {
    setExercises((prev) => prev.filter((ex) => ex.id !== exerciseId));
  };

  const removeSet = (exerciseId, setId) => {
    setExercises((prev) =>
      prev.map((ex) => {
        if (ex.id !== exerciseId) return ex;
        return { ...ex, sets: ex.sets.filter((set) => set.id !== setId) };
      })
    );
  };

  const sanitizeFieldValue = (field, rawValue) => {
    if (typeof rawValue !== "string") return rawValue;
    if (field === "weight") {
      return sanitizeNumberInput(rawValue, { allowDecimal: true, maxIntegerDigits: 4, maxDecimalDigits: 1 });
    }
    if (field === "reps") {
      return sanitizeNumberInput(rawValue, { allowDecimal: false, maxIntegerDigits: 3 });
    }
    return rawValue;
  };

  const updateSetField = (exerciseId, setId, field, rawValue) => {
    const value = sanitizeFieldValue(field, rawValue);
    setExercises((prev) =>
      prev.map((ex) => {
        if (ex.id !== exerciseId) return ex;
        return {
          ...ex,
          sets: ex.sets.map((set) =>
            set.id === setId ? { ...set, [field]: value } : set
          ),
        };
      })
    );

    if (field === "weight") {
      const numeric = parseFloat(value);
      if (numeric && numeric > 1000) {
        setWeightWarning(numeric);
      }
    }
  };

  const totalSets = exercises.reduce((sum, ex) => sum + ex.sets.length, 0);
  const totalWeight = exercises.reduce((weight, ex) => {
    return weight + ex.sets.reduce((setSum, set) => {
      const parsedW = parseFloat(set.weight);
      const parsedR = parseFloat(set.reps);
      if (!Number.isFinite(parsedW) || !Number.isFinite(parsedR)) return setSum;
      return setSum + Math.max(0, parsedW * parsedR);
    }, 0);
  }, 0);
  const canComplete = totalSets > 0;

  return (
    <>
      <div className="wkActiveWorkout">
        <div className="wkWorkoutHero">
          <div className="wkWorkoutHeader">
            <button className="wkBackBtn" onClick={onClose}>Cancel</button>
            <div className="wkWorkoutTitle">{routine.title}</div>
            <button className="wkCloseBtn" onClick={onClose} aria-label="Close workout">×</button>
          </div>
        <div className="wkHeroStats">
          <div className="wkHeroStat"><span>Exercises</span><b>{exercises.length}</b></div>
          <div className="wkHeroStat"><span>Sets</span><b>{totalSets}</b></div>
          <div className="wkHeroStat"><span>Total weight</span><b>{Math.round(totalWeight)} kg</b></div>
        </div>
        </div>

        <div className="wkWorkoutBody">
          <div className="wkWorkoutMeta">
            Tap into weight/reps to log each set · Total weight: {Math.round(totalWeight)} kg
          </div>
          <div className="wkExercisesList">
            {exercises.map((ex) => (
              <div key={ex.id} className="wkWorkoutExercise">
              <div className="wkExerciseHeader">
                <div className="wkExerciseTitle">
                  <span className="wkExerciseName">{ex.name}</span>
                  {lastSets?.[ex.name] ? (
                    <span className="wkExerciseGhost">
                      Last: {lastSets[ex.name].weight ?? "-"} kg × {lastSets[ex.name].reps ?? "-"}
                    </span>
                  ) : null}
                </div>
                <button className="wkRemoveBtn" onClick={() => removeExercise(ex.id)}>×</button>
              </div>

              <div className="wkSetsList">
                {ex.sets.map((set, setIdx) => (
                  <div className="wkSetRow" key={set.id}>
                    <div className="wkSetNum">{setIdx + 1}</div>
                    <input
                      className="wkSetInput"
                      placeholder={
                        lastSets?.[ex.name]?.weight != null && lastSets[ex.name].weight !== ""
                          ? String(lastSets[ex.name].weight)
                          : "kg"
                      }
                      type="text"
                      inputMode="decimal"
                      pattern="[0-9]*[.]?[0-9]*"
                      data-exercise-id={ex.id}
                      data-set-id={set.id}
                      data-field="weight"
                      value={set.weight}
                      onKeyDown={(e) => handleNumericKeyDown(e, { allowDecimal: true })}
                      onPaste={(e) => handleNumericPaste(e, { allowDecimal: true, maxIntegerDigits: 4, maxDecimalDigits: 1 })}
                      onChange={(e) => updateSetField(ex.id, set.id, "weight", e.target.value)}
                    />
                    <input
                      className="wkSetInput"
                      placeholder={
                        lastSets?.[ex.name]?.reps != null && lastSets[ex.name].reps !== ""
                          ? String(lastSets[ex.name].reps)
                          : "reps"
                      }
                      type="text"
                      inputMode="numeric"
                      pattern="[0-9]*"
                      data-exercise-id={ex.id}
                      data-set-id={set.id}
                      data-field="reps"
                      value={set.reps}
                      onKeyDown={(e) => handleNumericKeyDown(e, { allowDecimal: false })}
                      onPaste={(e) => handleNumericPaste(e, { allowDecimal: false, maxIntegerDigits: 3, maxDecimalDigits: 0 })}
                      onChange={(e) => updateSetField(ex.id, set.id, "reps", e.target.value)}
                    />
                    <button
                      className={`wkSetChip ${set.failure ? "on" : ""}`}
                      onClick={() => updateSetField(ex.id, set.id, "failure", !set.failure)}
                    >
                      F
                    </button>
                    <button
                      className={`wkSetChip ${set.dropset ? "on" : ""}`}
                      onClick={() => updateSetField(ex.id, set.id, "dropset", !set.dropset)}
                    >
                      D
                    </button>
                    <button
                      className="wkSetDelete"
                      onClick={() => removeSet(ex.id, set.id)}
                      aria-label="Remove set"
                    >
                      ×
                    </button>
                  </div>
                ))}
                <button className="wkAddSetBtn" onClick={() => addSet(ex.id)}>+ Add set</button>
              </div>
            </div>
          ))}
        </div>

        <div className="wkAddExerciseForm">
          <input
            className="wkAddExInput"
            value={newExercise}
            onChange={(e) => setNewExercise(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleAddExercise()}
            placeholder="Search or add exercise..."
            autoFocus
          />
          <button className="wkAddExSubmit" onClick={handleAddExercise}>Add</button>
        </div>

        <button
          className="wkCompleteBtn"
          disabled={!canComplete}
          onClick={() =>
            onComplete({
              title: routine.title,
              exerciseCount: exercises.length,
              setCount: totalSets,
              totalWeight: Math.round(totalWeight),
              exercises: exercises.map((ex) => ex.name),
              exerciseSets: exercises.map((ex) => ({
                name: ex.name,
                sets: ex.sets.map((set) => ({
                  weight: set.weight,
                  reps: set.reps,
                  failure: set.failure,
                  dropset: set.dropset,
                })),
              })),
            })
          }
        >
          ✓ Complete Workout
        </button>
        </div>
        </div>

      {weightWarning && (
        <WeightWarning
          weight={weightWarning}
          onCancel={() => setWeightWarning(null)}
          onConfirm={() => setWeightWarning(null)}
        />
      )}
    </>
  );
}

function WorkoutActionsSheet({ open, onClose, onStartEmpty, onCreateRoutine, onDiscover }) {
  if (!open) return null;

  return (
    <div className="wkSheetBackdrop" onClick={onClose} role="presentation">
      <div className="wkSheet" onClick={(e) => e.stopPropagation()} role="dialog" aria-modal="true">
        <div className="wkSheetHandle" />
        <div className="wkSheetHeader">
          <button className="wkSheetTextBtn" onClick={onClose}>Close</button>
          <div className="wkSheetTitle">Quick Actions</div>
          <div style={{ width: "60px" }}></div>
        </div>
        <div className="wkActionList">
          <button className="wkActionItem" onClick={onStartEmpty}>
            <div className="wkActionIcon">⚡</div>
            <div className="wkActionContent">
              <div className="wkActionTitle">Start Empty Workout</div>
              <div className="wkActionSub">Log sets right away</div>
            </div>
            <div className="wkActionChevron">›</div>
          </button>
          <button className="wkActionItem" onClick={onCreateRoutine}>
            <div className="wkActionIcon">🗒️</div>
            <div className="wkActionContent">
              <div className="wkActionTitle">New Routine</div>
              <div className="wkActionSub">Build and save a workout</div>
            </div>
            <div className="wkActionChevron">›</div>
          </button>
          <button className="wkActionItem" onClick={onDiscover}>
            <div className="wkActionIcon">🔎</div>
            <div className="wkActionContent">
              <div className="wkActionTitle">Discover Workouts</div>
              <div className="wkActionSub">Add from templates</div>
            </div>
            <div className="wkActionChevron">›</div>
          </button>
        </div>
      </div>
    </div>
  );
}

function WorkoutCompleteSheet({ open, summary, onDone, onPost }) {
  if (!open || !summary) return null;

  return (
    <div className="wkSheetBackdrop" role="presentation">
      <div className="wkSheet wkDoneSheet" role="dialog" aria-modal="true">
        <div className="wkDoneIcon">✓</div>
        <div className="wkDoneTitle">Workout Completed</div>
        <div className="wkDoneMeta">{summary.exerciseCount} exercises • {summary.setCount} sets logged</div>
        <div className="wkDoneHint">Want to post this workout to your feed?</div>
        <button
          className="wkDoneBtn"
          onClick={() => onPost?.()}
        >
          Post this to your friends?
        </button>
        <button className="wkDoneBtn" onClick={onDone}>Done</button>
      </div>
    </div>
  );
}

export default function WorkoutsScreen({ userId }) {
  const useRemote = Boolean(isSupabaseConfigured && userId);
  // This local state makes the screen feel real immediately.
  const [routines, setRoutines] = useState(loadSavedRoutines);
  const [createOpen, setCreateOpen] = useState(false);
  const [discoverOpen, setDiscoverOpen] = useState(false);
  const [selectedRoutine, setSelectedRoutine] = useState(null);
  const [routineDetailsOpen, setRoutineDetailsOpen] = useState(false);
  const [activeWorkout, setActiveWorkout] = useState(null);
  const [completeSummary, setCompleteSummary] = useState(null);
  const [actionsOpen, setActionsOpen] = useState(false);
  const [lastSets, setLastSets] = useState(loadLastSets);
  const anySheetOpen = createOpen || discoverOpen || routineDetailsOpen || actionsOpen;

  useEffect(() => {
    const handleOpenActions = () => setActionsOpen(true);
    window.addEventListener("open-workout-actions", handleOpenActions);
    return () => window.removeEventListener("open-workout-actions", handleOpenActions);
  }, []);

  useEffect(() => {
    if (!useRemote) return;
    let active = true;

    (async () => {
      const { data, error } = await listWorkoutRoutines({ userId });
      if (!active) return;
      if (error) {
        console.error("Failed to load workout routines from Supabase", error);
        return;
      }
      if (Array.isArray(data) && data.length > 0) {
        setRoutines(data);
        saveRoutines(data);
        return;
      }
      setRoutines(MOCK_ROUTINES);
    })();

    return () => {
      active = false;
    };
  }, [useRemote, userId]);

  useEffect(() => {
    if (typeof document === "undefined") return undefined;
    document.body.classList.toggle("wk-sheet-open", anySheetOpen);
    return () => document.body.classList.remove("wk-sheet-open");
  }, [anySheetOpen]);

  function updateRoutines(updater) {
    setRoutines((prev) => {
      const next = typeof updater === "function" ? updater(prev) : updater;
      saveRoutines(next);
      return next;
    });
  }

  async function handleCreate(title, exercises = []) {
    const normalizedTitle = normalizeTitle(title);
    const duplicate = routines.find((r) => normalizeTitle(r.title) === normalizedTitle);
    if (duplicate) {
      setSelectedRoutine(duplicate);
      setRoutineDetailsOpen(true);
      return;
    }

    const newRoutine = {
      id: `r_${Date.now()}`,
      title,
      meta: `${(exercises.length || 0)} exercises • ~0 min`,
      description: "Custom routine",
      exercises: exercises.length ? exercises : [],
    };

    if (useRemote) {
      const { data, error } = await createWorkoutRoutine({
        userId,
        routine: newRoutine,
      });
      if (error) {
        console.error("Failed to create routine in Supabase", error);
      }
      updateRoutines((prev) => [data || newRoutine, ...prev]);
      setCreateOpen(false);
      return;
    }

    updateRoutines((prev) => {
      const routineExercises = exercises.length ? exercises : [];
      const meta = `${routineExercises.length} exercises • ~0 min`;
      return [
        { id: `r_${Date.now()}`, title, meta, description: "Custom routine", exercises: routineExercises },
        ...prev,
      ];
    });
    setCreateOpen(false);
  }

  function handleOpenRoutine(routine) {
    setSelectedRoutine(routine);
    setRoutineDetailsOpen(true);
  }

  function handleStartEmptyWorkout() {
    setActiveWorkout({ title: "Quick Workout", exercises: [] });
    setActionsOpen(false);
  }

  function handleStartRoutineWorkout(routine) {
    setActiveWorkout(routine);
    setRoutineDetailsOpen(false);
  }

  async function handleAddFromDiscover(workout) {
    const duplicate = routines.find((r) => normalizeTitle(r.title) === normalizeTitle(workout.title));
    if (duplicate) {
      setSelectedRoutine(duplicate);
      setRoutineDetailsOpen(true);
      return;
    }

    const routineToAdd = {
      id: `r_${Date.now()}`,
      title: workout.title,
      meta: `${workout.exercises} exercises • ${workout.duration}`,
      description: workout.difficulty,
      exercises: workout.exampleMoves || Array(workout.exercises).fill(null).map((_, i) => `Exercise ${i + 1}`),
    };

    if (useRemote) {
      const { data, error } = await createWorkoutRoutine({
        userId,
        routine: routineToAdd,
      });
      if (error) {
        console.error("Failed to save discover workout to Supabase", error);
      }
      updateRoutines((prev) => [data || routineToAdd, ...prev]);
      return;
    }

    updateRoutines((prev) => [
      {
        id: `r_${Date.now()}`,
        title: workout.title,
        meta: `${workout.exercises} exercises • ${workout.duration}`,
        description: workout.difficulty,
        exercises: workout.exampleMoves || Array(workout.exercises).fill(null).map((_, i) => `Exercise ${i + 1}`)
      },
      ...prev,
    ]);
  }

  async function handleToggleDiscoverWorkout(workout) {
    const normalizedWorkoutTitle = normalizeTitle(workout.title);
    const exists = routines.find((r) => normalizeTitle(r.title) === normalizedWorkoutTitle);
    if (exists) {
      if (useRemote) {
        const { error } = await deleteWorkoutRoutine({ userId, routineId: exists.id });
        if (error) {
          console.error("Failed to remove discover workout from Supabase", error);
          return;
        }
      }
      updateRoutines((prev) => prev.filter((r) => normalizeTitle(r.title) !== normalizedWorkoutTitle));
      return;
    }
    await handleAddFromDiscover(workout);
  }

  async function handleRemoveRoutine(routineId) {
    if (useRemote) {
      const { error } = await deleteWorkoutRoutine({ userId, routineId });
      if (error) {
        console.error("Failed to remove routine from Supabase", error);
        return;
      }
    }
    updateRoutines((prev) => prev.filter((r) => r.id !== routineId));
    if (selectedRoutine?.id === routineId) {
      setRoutineDetailsOpen(false);
      setSelectedRoutine(null);
    }
  }

  useEffect(() => {
    if (!activeWorkout) return;
    const names = (activeWorkout.exercises || [])
      .map((ex) => (typeof ex === "string" ? ex : ex?.name))
      .filter(Boolean);
    if (names.length === 0) {
      setLastSets({});
      return;
    }

    if (useRemote) {
      let active = true;
      (async () => {
        const { data, error } = await listLastExerciseSets({ userId, exerciseNames: names });
        if (!active) return;
        if (error) {
          console.error("Failed to load last sets", error);
          return;
        }
        setLastSets(data || {});
      })();
      return () => {
        active = false;
      };
    }

    const local = loadLastSets();
    const filtered = {};
    names.forEach((name) => {
      if (local[name]) filtered[name] = local[name];
    });
    setLastSets(filtered);
  }, [useRemote, activeWorkout, userId]);

  // Show active workout screen instead of routine list
  if (activeWorkout) {
    return (
      <ActiveWorkoutScreen
        routine={activeWorkout}
        lastSets={lastSets}
        onClose={() => setActiveWorkout(null)}
        onComplete={async (summary) => {
          if (useRemote) {
            const { error } = await addWorkoutSessionWithSets({
              userId,
              title: activeWorkout.title,
              exerciseCount: summary.exerciseCount,
              setCount: summary.setCount,
              exercises: summary.exerciseSets,
            });
            if (error) {
              console.error("Failed to save workout session to Supabase", error);
            }
          }
          const nextLast = { ...loadLastSets() };
          (summary.exerciseSets || []).forEach((exercise) => {
            const name = exercise?.name;
            if (!name) return;
            const sets = Array.isArray(exercise.sets) ? exercise.sets : [];
            const last = sets[sets.length - 1];
            if (!last) return;
            nextLast[name] = {
              weight: last.weight,
              reps: last.reps,
            };
          });
          saveLastSets(nextLast);
          setLastSets(nextLast);
          setActiveWorkout(null);
          setCompleteSummary(summary);
        }}
      />
    );
  }

  return (
    <div className="screenBody wkScreenBody">
      <div className="wkHeader">
        <div className="wkTitle">Workouts</div>
      </div>

      <Section title="Quick Start" />
      <RowButton
        icon="⚡"
        title="Start Empty Workout"
        subtitle="Log sets as you go"
        onClick={handleStartEmptyWorkout}
      />

      <Section title="Routines" />
      <div className="wkTiles">
        <Tile icon="🗒️" title="New Routine" onClick={() => setCreateOpen(true)} />
        <Tile icon="🔎" title="Discover More" onClick={() => setDiscoverOpen(true)} />
      </div>

      <div className="wkList">
        {routines.map((r) => (
          <RoutineCard key={r.id} r={r} onOpen={handleOpenRoutine} onRemove={handleRemoveRoutine} />
        ))}
      </div>

      <CreateRoutineSheet
        open={createOpen}
        onClose={() => setCreateOpen(false)}
        onCreate={handleCreate}
      />

      <RoutineDetailsSheet
        routine={selectedRoutine}
        open={routineDetailsOpen}
        onClose={() => setRoutineDetailsOpen(false)}
        onAddToWorkout={handleStartRoutineWorkout}
      />

      <DiscoverWorkoutsSheet
        open={discoverOpen}
        onClose={() => setDiscoverOpen(false)}
        onToggle={handleToggleDiscoverWorkout}
        routines={routines}
      />

      <WorkoutCompleteSheet
        open={Boolean(completeSummary)}
        summary={completeSummary}
        onDone={() => setCompleteSummary(null)}
        onPost={() => {
          if (typeof window !== "undefined" && completeSummary) {
            window.dispatchEvent(new CustomEvent("workout-post", { detail: completeSummary }));
          }
          setCompleteSummary(null);
        }}
      />

      <WorkoutActionsSheet
        open={actionsOpen}
        onClose={() => setActionsOpen(false)}
        onStartEmpty={handleStartEmptyWorkout}
        onCreateRoutine={() => {
          setActionsOpen(false);
          setCreateOpen(true);
        }}
        onDiscover={() => {
          setActionsOpen(false);
          setDiscoverOpen(true);
        }}
      />
    </div>
  );
}
