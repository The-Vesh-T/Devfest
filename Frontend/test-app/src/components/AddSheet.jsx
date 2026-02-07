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
            <div className="sheetActions">
              <button className="sheetAction">
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
