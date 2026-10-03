import { useRef, useState } from "react";
import { Icon } from "./Icon";
const iso = (date: Date) =>
  `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
export function DatePicker({ name, label }: { name: string; label: string }) {
  const [value, setValue] = useState("");
  const [open, setOpen] = useState(false);
  const [cursor, setCursor] = useState(() => new Date());
  const trigger = useRef<HTMLButtonElement>(null);
  const month = cursor.getMonth(),
    year = cursor.getFullYear(),
    lead = (new Date(year, month, 1).getDay() + 6) % 7;
  const pick = (date: string) => {
    setValue(date);
    setOpen(false);
    trigger.current?.focus();
  };
  const display = value
    ? new Intl.DateTimeFormat("en-GB", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      }).format(new Date(`${value}T12:00:00`))
    : "Select a date";
  return (
    <div
      className="date-field"
      onKeyDown={(event) => {
        if (event.key === "Escape" && open) {
          event.stopPropagation();
          setOpen(false);
          trigger.current?.focus();
        }
      }}
    >
      <button
        type="button"
        className="date-trigger"
        id={`field-${name}`}
        aria-label={`${label}: ${display}`}
        aria-haspopup="dialog"
        aria-expanded={open}
        ref={trigger}
        onClick={() => setOpen((value) => !value)}
      >
        <span className={`date-value ${value ? "" : "is-empty"}`}>
          {display}
        </span>
        <Icon name="calendar" />
      </button>
      <input type="hidden" name={name} value={value} />
      {open && (
        <div className="date-pop" role="group" aria-label={`${label} calendar`}>
          <div className="date-pop-head">
            <strong>
              {new Intl.DateTimeFormat("en-GB", {
                month: "long",
                year: "numeric",
              }).format(cursor)}
            </strong>
            <div className="date-nav">
              <button
                type="button"
                aria-label="Previous month"
                onClick={() => setCursor(new Date(year, month - 1, 1))}
              >
                <Icon name="chev" />
              </button>
              <button
                type="button"
                aria-label="Next month"
                onClick={() => setCursor(new Date(year, month + 1, 1))}
              >
                <Icon name="chev" />
              </button>
            </div>
          </div>
          <div className="date-weekdays">
            {["Mo", "Tu", "We", "Th", "Fr", "Sa", "Su"].map((day) => (
              <span key={day}>{day}</span>
            ))}
          </div>
          <div className="date-grid">
            {Array.from(
              {
                length: 42,
              },
              (_, index) => {
                const date = new Date(year, month, index - lead + 1),
                  id = iso(date);
                return (
                  <button
                    type="button"
                    className={`date-day ${date.getMonth() !== month ? "is-out" : ""} ${id === iso(new Date()) ? "is-today" : ""} ${id === value ? "is-selected" : ""}`}
                    aria-pressed={id === value}
                    aria-label={new Intl.DateTimeFormat("en-GB", {
                      day: "numeric",
                      month: "long",
                      year: "numeric",
                    }).format(date)}
                    key={id}
                    onClick={() => pick(id)}
                  >
                    {date.getDate()}
                  </button>
                );
              },
            )}
          </div>
          <div className="date-pop-foot">
            <button type="button" onClick={() => pick("")}>
              Clear
            </button>
            <button type="button" onClick={() => pick(iso(new Date()))}>
              Today
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
