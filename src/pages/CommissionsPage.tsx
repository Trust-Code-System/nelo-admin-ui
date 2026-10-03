import { filterRecords } from "../lib/records";
import type { AdminState } from "../types";
import { I, status, btn, control, pageHead } from "../components/presentation";
import { jobs } from "../data/fixtures";
export function CommissionsPage({ state }: { state: AdminState }) {
  return (
    <div className="page">
      {pageHead(
        "Atelier",
        "Commissions",
        "Track each commission by production stage.",
        <>
          {control("All makers", "team")}
          {btn("New commission")}
        </>,
      )}
      <section className="board-summary">
        <div className="board-summary-copy">
          <strong>Atelier workboard</strong>
          <span>Six active commissions · last synced 6 minutes ago</span>
        </div>
        <div className="board-stat">
          <strong>06</strong>
          <span>Active</span>
        </div>
        <div className="board-stat">
          <strong>03</strong>
          <span>Due in 7 days</span>
        </div>
        <div className="board-stat is-risk">
          <strong>01</strong>
          <span>Needs intervention</span>
        </div>
      </section>
      <div className="kanban">
        {(
          [
            ["Requested", jobs.slice(0, 2), ["Confirm brief", "Assign maker"]],
            ["Cutting", jobs.slice(2, 4), ["Approve pattern", "Prepare toile"]],
            ["Sewing", jobs.slice(4, 5), ["Construction review"]],
            ["Fitting", jobs.slice(5), ["Resolve fit notes"]],
          ] as [string, string[][], string[]][]
        ).map(([name, arr, next], ci) => (
          <section className="kanban-col" key={ci}>
            <div className="kanban-head">
              <div>
                <i />
                <strong>{name}</strong>
              </div>
              <span>{arr.length.toString().padStart(2, "0")}</span>
            </div>
            {filterRecords(arr, state).map((r, i) => (
              <button className="job-card" data-detail={r[2]} key={i}>
                <div className="job-ref">
                  <span>{r[0]}</span>
                  <span>{r[3]}</span>
                </div>
                <h3>{r[2]}</h3>
                <p>
                  {r[1]}
                  {" · "}
                  {ci === 0
                    ? "Brief received"
                    : ci === 1
                      ? "Pattern in progress"
                      : ci === 2
                        ? "Main construction"
                        : "Fitting review"}
                </p>
                <div className="job-next">
                  <span>{next[Math.min(i, next.length - 1)]}</span>
                  {I("chev")}
                </div>
                <div className="job-meta">
                  <div className="assignees">
                    <i>{r[4]}</i>
                    {i === 0 ? <i>AA</i> : ""}
                  </div>
                  {status(
                    ci === 3 ? "At risk" : "On track",
                    ci === 3 ? "red" : "green",
                  )}
                </div>
              </button>
            ))}
          </section>
        ))}
      </div>
    </div>
  );
}
