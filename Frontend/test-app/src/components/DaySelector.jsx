import { useEffect, useMemo, useState } from "react";
import "./DaySelector.css";

const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const MONTHS = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

function startOfDay(date) {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

export default function DaySelector({ selectedDate, onChangeDate }) {
  const [calendarOpen, setCalendarOpen] = useState(false);
  const today = startOfDay(new Date());
  const [cursor, setCursor] = useState(() => {
    const base = selectedDate ?? new Date();
    return new Date(base.getFullYear(), base.getMonth(), 1);
  });
  const isCurrentMonth =
    cursor.getFullYear() === today.getFullYear() && cursor.getMonth() === today.getMonth();

  const selected = useMemo(() => startOfDay(selectedDate ?? new Date()), [selectedDate]);
  const selectedDayName = DAYS[selected.getDay()];

  const monthLabel = `${MONTHS[cursor.getMonth()]} ${cursor.getFullYear()}`;
  const daysGrid = useMemo(() => {
    const year = cursor.getFullYear();
    const month = cursor.getMonth();
    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const cells = [];
    for (let i = 0; i < firstDay; i += 1) cells.push(null);
    for (let d = 1; d <= daysInMonth; d += 1) cells.push(d);
    return cells;
  }, [cursor]);

  const prevMonth = () => setCursor((d) => new Date(d.getFullYear(), d.getMonth() - 1, 1));
  const nextMonth = () => {
    if (isCurrentMonth) return;
    setCursor((d) => new Date(d.getFullYear(), d.getMonth() + 1, 1));
  };

  const goPrevDay = () => {
    const next = new Date(selected.getFullYear(), selected.getMonth(), selected.getDate() - 1);
    onChangeDate?.(next);
  };

  const goNextDay = () => {
    if (selected >= today) return;
    const next = new Date(selected.getFullYear(), selected.getMonth(), selected.getDate() + 1);
    if (next <= today) onChangeDate?.(next);
  };

  const handleSelectDate = (day) => {
    const next = new Date(cursor.getFullYear(), cursor.getMonth(), day);
    if (next > today) return;
    onChangeDate?.(next);
    setCalendarOpen(false);
  };

  useEffect(() => {
    if (calendarOpen) {
      setCursor(new Date(selected.getFullYear(), selected.getMonth(), 1));
    }
  }, [calendarOpen, selected]);

  return (
    <div className="dayHeader">
      <div className="daySchedule">
        <button className="dayArrow" onClick={goPrevDay} type="button" aria-label="Previous day">
          <span className="dayArrowIcon">‹</span>
        </button>
        <button className="dayLabelBtn" type="button" aria-label="Open calendar" onClick={() => setCalendarOpen(true)}>
          {selectedDayName}
        </button>
        <button
          className={`dayArrow ${selected >= today ? "disabled" : ""}`}
          onClick={goNextDay}
          type="button"
          aria-label="Next day"
          disabled={selected >= today}
        >
          <span className="dayArrowIcon">›</span>
        </button>
      </div>

      {calendarOpen ? (
        <div className="dayCalendarBackdrop" onClick={() => setCalendarOpen(false)} role="presentation">
          <div className="dayCalendarCard" onClick={(e) => e.stopPropagation()} role="dialog" aria-modal="true">
            <div className="dayCalendarHeader">
              <button className="dayCalendarNav" onClick={prevMonth} type="button" aria-label="Previous month">
                ‹
              </button>
              <div className="dayCalendarTitle">{monthLabel}</div>
              <button
                className={`dayCalendarNav ${isCurrentMonth ? "disabled" : ""}`}
                onClick={nextMonth}
                type="button"
                aria-label="Next month"
                disabled={isCurrentMonth}
              >
                ›
              </button>
            </div>

            <div className="dayCalendarWeekdays">
              {DAYS.map((d) => (
                <div key={d} className="dayCalendarWeekday">
                  {d}
                </div>
              ))}
            </div>

            <div className="dayCalendarGrid">
              {daysGrid.map((d, idx) => (
                <div
                  key={`${d ?? "x"}_${idx}`}
                  className={`dayCalendarCell ${d ? "" : "empty"} ${
                    isCurrentMonth && d && d > today.getDate() ? "disabled" : ""
                  } ${
                    d &&
                    selected.getFullYear() === cursor.getFullYear() &&
                    selected.getMonth() === cursor.getMonth() &&
                    selected.getDate() === d
                      ? "selected"
                      : ""
                  }`}
                  onClick={d ? () => handleSelectDate(d) : undefined}
                  role={d ? "button" : undefined}
                  tabIndex={d ? 0 : undefined}
                >
                  {d ?? ""}
                </div>
              ))}
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
