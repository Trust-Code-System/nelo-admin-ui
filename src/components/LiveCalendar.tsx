import { useEffect, useRef, useState, type CSSProperties } from "react";
import type { Appointment } from "../lib/admin-api";
const modes = ["Week", "Day", "Month", "List"] as const;
type Mode = (typeof modes)[number];
const key = (date: Date) =>
  `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`;
function plus(date: Date, days: number) {
  const next = new Date(date);
  next.setDate(next.getDate() + days);
  return next;
}
function start(date: Date) {
  const next = new Date(date);
  next.setHours(0, 0, 0, 0);
  return next;
}
function monday(date: Date) {
  return plus(start(date), -((date.getDay() + 6) % 7));
}
function intersects(a: Appointment, day: Date) {
  return (
    new Date(a.startsAt).getTime() < plus(start(day), 1).getTime() &&
    new Date(a.endsAt).getTime() > start(day).getTime()
  );
}
const clock = (value: string) =>
  new Date(value).toLocaleTimeString(undefined, {
    hour: "2-digit",
    minute: "2-digit",
  });
const client = (a: Appointment) =>
  `${a.customer.firstName} ${a.customer.lastName}`;
export function LiveCalendar({
  rows,
  onSelect,
}: {
  rows: Appointment[];
  onSelect: (appointment: Appointment) => void;
}) {
  const [mode, setMode] = useState<Mode>("Week"),
    [date, setDate] = useState(() => new Date());
  const days =
    mode === "Day"
      ? [start(date)]
      : Array.from({ length: 7 }, (_, i) => plus(monday(date), i));
  const scroll = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (scroll.current) scroll.current.scrollTop = 8 * 44 + 56;
  }, [mode, date]);
  const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
  const change = (direction: number) => {
    if (mode === "Month") {
      const next = new Date(date);
      next.setDate(1);
      next.setMonth(next.getMonth() + direction);
      setDate(next);
    } else setDate(plus(date, direction * (mode === "Week" ? 7 : 1)));
  };
  const monthStart = new Date(date.getFullYear(), date.getMonth(), 1);
  const monthDays = Array.from(
    {
      length:
        Math.ceil(
          (((monthStart.getDay() + 6) % 7) +
            new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate()) /
            7,
        ) * 7,
    },
    (_, i) => plus(monday(monthStart), i),
  );
  return (
    <>
      <div className="toolbar live-calendar-toolbar">
        <div
          className="segmented is-slider"
          style={
            {
              "--items": 4,
              "--active-index": modes.indexOf(mode),
            } as CSSProperties
          }
          role="group"
          aria-label="Calendar view"
        >
          {modes.map((value) => (
            <button
              className={`tab ${mode === value ? "active" : ""}`}
              key={value}
              aria-pressed={mode === value}
              onClick={() => setMode(value)}
            >
              {value}
            </button>
          ))}
        </div>
        <div className="live-calendar-range">
          <button
            className="icon-btn"
            aria-label="Previous date range"
            onClick={() => change(-1)}
          >
            ‹
          </button>
          <button className="ghost" onClick={() => setDate(new Date())}>
            Today
          </button>
          <button
            className="icon-btn"
            aria-label="Next date range"
            onClick={() => change(1)}
          >
            ›
          </button>
          <strong>
            {mode === "Week"
              ? `${days[0].toLocaleDateString(undefined, { day: "numeric", month: "short" })} – ${days[6].toLocaleDateString(undefined, { day: "numeric", month: "short", year: "numeric" })}`
              : date.toLocaleDateString(
                  undefined,
                  mode === "Month"
                    ? { month: "long", year: "numeric" }
                    : {
                        weekday: "long",
                        day: "numeric",
                        month: "long",
                        year: "numeric",
                      },
                )}
          </strong>
        </div>
      </div>
      <p className="live-hint">
        Calendar times: {timezone}. Open an appointment to see its recorded
        timezone and manage it.
      </p>
      {mode === "List" ? (
        <section className="panel">
          <div className="table-wrap">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Client</th>
                  <th>Purpose</th>
                  <th>Date and time</th>
                  <th>Status</th>
                  <th>Details</th>
                </tr>
              </thead>
              <tbody>
                {[...rows]
                  .sort((a, b) => a.startsAt.localeCompare(b.startsAt))
                  .map((a) => (
                    <tr key={a.id}>
                      <td>{client(a)}</td>
                      <td>{a.purpose}</td>
                      <td>{new Date(a.startsAt).toLocaleString()}</td>
                      <td>{a.status}</td>
                      <td>
                        <button className="ghost" onClick={() => onSelect(a)}>
                          View appointment
                        </button>
                      </td>
                    </tr>
                  ))}
                {!rows.length && (
                  <tr>
                    <td colSpan={5}>No appointments match this filter.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </section>
      ) : mode === "Month" ? (
        <section className="panel view-swap">
          <div className="panel-body">
            <div className="month-board">
              <div className="month-weekdays">
                {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map(
                  (day) => (
                    <span key={day}>{day}</span>
                  ),
                )}
              </div>
              <div className="month-grid">
                {monthDays.map((day) => (
                  <div
                    className={`month-cell ${key(day) === key(new Date()) ? "is-today" : ""} ${day.getMonth() !== date.getMonth() ? "is-outside" : ""}`}
                    key={key(day)}
                  >
                    <button
                      className="live-calendar-day"
                      aria-label={`Open ${day.toLocaleDateString()}`}
                      onClick={() => {
                        setDate(day);
                        setMode("Day");
                      }}
                    >
                      {day.getDate()}
                    </button>
                    {rows
                      .filter((a) => intersects(a, day))
                      .map((a) => (
                        <button
                          className="month-event"
                          key={a.id}
                          onClick={() => onSelect(a)}
                        >
                          {clock(a.startsAt)} · {client(a)} · {a.purpose}
                        </button>
                      ))}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>
      ) : (
        <div className="calendar-scroll" ref={scroll}>
          <div
            className="calendar-shell live-calendar-grid"
            style={{
              gridTemplateColumns: `4rem repeat(${days.length}, minmax(10rem, 1fr))`,
              minWidth: mode === "Day" ? "20rem" : "76rem",
            }}
          >
            <div className="cal-head">Time</div>
            {days.map((day) => (
              <div
                className={`cal-head cal-day ${key(day) === key(new Date()) ? "today" : ""}`}
                key={key(day)}
              >
                <strong>
                  {day.toLocaleDateString(undefined, { weekday: "short" })}
                </strong>
                <span>
                  {day.toLocaleDateString(undefined, {
                    day: "numeric",
                    month: "short",
                  })}
                </span>
              </div>
            ))}
            <div className="time-col" style={{ height: 1056 }}>
              {Array.from({ length: 24 }, (_, hour) => (
                <span
                  className="time-label"
                  style={{ top: `${hour * 44 + 8}px` }}
                  key={hour}
                >
                  {String(hour).padStart(2, "0")}:00
                </span>
              ))}
            </div>
            {days.map((day) => {
              const events = rows
                .filter((a) => intersects(a, day))
                .sort((a, b) => a.startsAt.localeCompare(b.startsAt));
              const laneEnds: number[] = [];
              const positioned = events.map((a) => {
                const beginning = new Date(a.startsAt),
                  ending = new Date(a.endsAt);
                const from =
                  beginning < day
                    ? 0
                    : beginning.getHours() * 60 + beginning.getMinutes();
                const to =
                  ending >= plus(day, 1)
                    ? 1440
                    : ending.getHours() * 60 + ending.getMinutes();
                let lane = laneEnds.findIndex((end) => end <= from);
                if (lane === -1) lane = laneEnds.length;
                laneEnds[lane] = to;
                return { a, from, to, lane };
              });
              return (
                <div
                  className="day-col"
                  key={key(day)}
                  style={{ height: 1056, backgroundSize: "100% 44px" }}
                >
                  {positioned.map(({ a, from, to, lane }) => (
                    <button
                      className={`cal-event ${a.status === "confirmed" ? "green" : a.status === "completed" ? "blue" : a.status === "cancelled" || a.status === "noShow" ? "amber" : ""}`}
                      key={a.id}
                      style={{
                        top: (from * 44) / 60,
                        height: Math.max(18, ((to - from) * 44) / 60),
                        left: `calc(${(lane / Math.max(1, laneEnds.length)) * 100}% + .25rem)`,
                        width: `calc(${100 / Math.max(1, laneEnds.length)}% - .5rem)`,
                        right: "auto",
                      }}
                      onClick={() => onSelect(a)}
                      title={`${client(a)} · ${a.purpose} · ${clock(a.startsAt)}–${clock(a.endsAt)} · ${a.status}`}
                    >
                      <strong>{client(a)}</strong>
                      <span>{a.purpose}</span>
                      <span>
                        {clock(a.startsAt)}–{clock(a.endsAt)} · {a.status}
                      </span>
                    </button>
                  ))}
                </div>
              );
            })}
          </div>
        </div>
      )}
    </>
  );
}
