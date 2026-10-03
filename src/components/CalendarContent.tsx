import type { AdminState } from "../types";
import { apptRows } from "../data/fixtures";
import { I, status, schedule, calendarWeekMarkup } from "./presentation";
export function CalendarContent({ state }: { state: AdminState }) {
  if (state.calendarMode === "Week") return calendarWeekMarkup();
  if (state.calendarMode === "Day")
    return (
      <section className="panel view-swap">
        <div className="panel-head">
          <h2>Thursday, 24 September</h2>
          <span className="muted">4 demo appointments</span>
        </div>
        <div className="panel-body">{schedule()}</div>
      </section>
    );
  if (state.calendarMode === "List")
    return (
      <section className="panel view-swap">
        <div className="panel-head">
          <h2>Appointment list</h2>
          <span className="muted">6 demo records</span>
        </div>
        <div className="table-wrap">
          <table className="data-table">
            <thead>
              <tr>
                {[
                  "Client",
                  "Date and time",
                  "Location",
                  "Status",
                  "Details",
                ].map((label) => (
                  <th key={label}>{label}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {apptRows.map((row) => (
                <tr key={row[1]}>
                  <td>
                    <strong>{row[1]}</strong>
                    <div className="muted">{row[2]}</div>
                  </td>
                  <td className="mono">{row[3]}</td>
                  <td>{row[4]}</td>
                  <td>{status(row[5], row[6])}</td>
                  <td>
                    <button
                      className="row-actions"
                      data-detail={`${row[1]} · ${row[2]}`}
                      aria-label={`Open ${row[1]}`}
                    >
                      {I("chev")}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    );
  const events: Record<number, string[]> = {
    21: ["Bridal fitting"],
    22: ["Consultation"],
    23: ["Fabric review"],
    24: ["Fitting · Look 03", "Virtual follow-up"],
    25: ["Bridal consultation"],
    28: ["Measurements"],
  };
  return (
    <section className="panel view-swap">
      <div className="panel-head">
        <h2>September 2026</h2>
        <span className="muted">Demo schedule</span>
      </div>
      <div className="panel-body">
        <div className="month-board">
          <div className="month-weekdays">
            {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((day) => (
              <span key={day}>{day}</span>
            ))}
          </div>
          <div className="month-grid">
            {Array.from(
              {
                length: 35,
              },
              (_, index) => {
                const day = index - 1;
                return day < 1 || day > 30 ? (
                  <span className="month-cell" aria-hidden="true" key={index} />
                ) : (
                  <button
                    className={`month-cell ${day === 24 ? "is-today" : ""}`}
                    data-detail={`${day} September`}
                    key={index}
                  >
                    <span className="month-number">{day}</span>
                    {events[day]?.map((event) => (
                      <span className="month-event" key={event}>
                        {event}
                      </span>
                    ))}
                  </button>
                );
              },
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
