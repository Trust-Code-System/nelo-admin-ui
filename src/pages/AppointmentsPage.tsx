import { useAdminConnection } from "../components/AdminConnection";
import { ConnectedAppointments } from "./ConnectedAppointments";
import { EmptyResults } from "../components/EmptyResults";
import { filterRecords } from "../lib/records";
import type { AdminState } from "../types";
import { I, status, btn, control, pageHead } from "../components/presentation";
import { apptRows } from "../data/fixtures";
export function AppointmentsPage({ state }: { state: AdminState }) {
  const connection = useAdminConnection();
  if (connection) return <ConnectedAppointments key={connection.channel.id} />;
  return (
    <div className="page">
      {pageHead(
        "Atelier",
        "Appointments",
        "View, confirm and manage appointment requests.",
        <>{btn("New appointment")}</>,
      )}
      <div className="toolbar">
        <label className="search-field">
          {I("search")}
          <input
            type="search"
            aria-label="Search client or appointment"
            placeholder="Search client or appointment"
          />
        </label>
        {control("All statuses", "status")}
        {control("This week", "range")}
        {btn("Filters", "filter", "ghost")}
      </div>
      <section className="panel">
        <div className="table-wrap">
          <table className="data-table">
            <thead>
              <tr>
                <th>Client</th>
                <th>Purpose</th>
                <th>{"Date & time"}</th>
                <th>Location</th>
                <th>Status</th>
                <th>
                  <span className="sr-only">Details</span>
                </th>
              </tr>
            </thead>
            <tbody>
              {filterRecords(apptRows, state).length ? (
                filterRecords(apptRows, state).map((r, index) => (
                  <tr key={index}>
                    <td>
                      <div className="cell-title">
                        <span className="mini-avatar">{r[0]}</span>
                        <div>
                          <strong>{r[1]}</strong>
                          <span>Returning client</span>
                        </div>
                      </div>
                    </td>
                    <td>{r[2]}</td>
                    <td className="mono">{r[3]}</td>
                    <td>{r[4]}</td>
                    <td>{status(r[5], r[6])}</td>
                    <td>
                      <button
                        className="row-actions"
                        aria-label={`Open ${r[1]}`}
                        data-toast={"Opened " + r[1]}
                      >
                        {I("more")}
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <EmptyResults table={true} />
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
