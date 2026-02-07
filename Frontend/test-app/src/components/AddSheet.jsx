export default function AddSheet({ open, onClose, mode }) {
  if (!open) return null;

  return (
    <div className="sheetBackdrop" onClick={onClose} role="presentation">
      <div className="sheet" onClick={(e) => e.stopPropagation()} role="dialog" aria-modal="true">
        <div className="sheetHandle" />
        <div className="sheetHeader">
          <div className="sheetTitle">Add {mode === "food" ? "food" : "workout"}</div>
          <button className="xBtn" onClick={onClose} aria-label="Close">
            ✕
          </button>
        </div>

        {mode === "food" ? (
          <>
            <input className="input" placeholder="Search food (e.g., banana)" />
            <div className="row">
              <input className="input" placeholder="Serving (e.g., 100g)" />
              <input className="input" placeholder="Calories" />
            </div>
            <button className="primaryBtn">Add to diary</button>
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
