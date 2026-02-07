import "./DaySelector.css";

const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

export default function DaySelector({ activeDay, onPrev, onNext }) {
  return (
    <div className="daySchedule">
      <button className="dayArrow" onClick={onPrev} type="button" aria-label="Previous day">
        <span className="dayArrowIcon">‹</span>
      </button>
      <div className="dayLabel">{DAYS[activeDay]}</div>
      <button className="dayArrow" onClick={onNext} type="button" aria-label="Next day">
        <span className="dayArrowIcon">›</span>
      </button>
    </div>
  );
}
