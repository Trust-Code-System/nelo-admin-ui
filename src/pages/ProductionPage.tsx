import { EmptyResults } from "../components/EmptyResults";
import { filterRecords } from "../lib/records";
import type { AdminState } from "../types";
import {
  css,
  status,
  btn,
  control,
  pageHead,
  rail,
} from "../components/presentation";
import { jobs } from "../data/fixtures";
export function ProductionPage({ state }: { state: AdminState }) {
  return (
    <div className="page">
      {pageHead(
        "Atelier",
        "Production",
        "Track garments by stage, maker and target date.",
        <>
          {control("All teams", "team")}
          {btn("Add production note", "plus")}
        </>,
      )}
      <section className="panel">
        <div className="panel-head">
          <h2>Current stages</h2>
          <span className="muted">Updated 6 minutes ago</span>
        </div>
        <div className="panel-body">{rail()}</div>
      </section>
      <div className="grid">
        <section className="panel span-8">
          <div className="panel-head">
            <h2>Garment queue</h2>
            {control("Target date", "productionSort")}
          </div>
          <div className="table-wrap">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Reference</th>
                  <th>Garment</th>
                  <th>Stage</th>
                  <th>Maker</th>
                  <th>Target</th>
                  <th>Health</th>
                </tr>
              </thead>
              <tbody>
                {filterRecords(jobs, state).length ? (
                  filterRecords(jobs, state).map((r, i) => (
                    <tr key={i}>
                      <td className="mono">{r[0]}</td>
                      <td>
                        <strong>{r[2]}</strong>
                        <div className="muted">{r[1]}</div>
                      </td>
                      <td>
                        {
                          [
                            "Measured",
                            "Cutting",
                            "Cutting",
                            "Sewing",
                            "Finishing",
                            "Fitting",
                          ][i]
                        }
                      </td>
                      <td>
                        {
                          ["Ajao", "Bashir", "Bashir", "Ajao", "Kemi", "Kemi"][
                            i
                          ]
                        }
                      </td>
                      <td className="mono">{r[3]}</td>
                      <td>
                        {status(
                          i === 5 ? "Blocked" : i === 4 ? "Watch" : "On track",
                          i === 5 ? "red" : i === 4 ? "amber" : "green",
                        )}
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
        <section className="panel span-4">
          <div className="panel-head">
            <h2>Capacity</h2>
            <span className="muted">This week</span>
          </div>
          <div className="panel-body">
            {(
              [
                ["Cutting", 14, 17],
                ["Sewing", 19, 22],
                ["Finishing", 11, 12],
                ["QC", 7, 14],
              ] as [string, number, number][]
            ).map((r, index) => (
              <div style={css("margin-bottom:1rem")} key={index}>
                <div
                  style={css(
                    "display:flex;justify-content:space-between;font-size:.72rem",
                  )}
                >
                  <strong>{r[0]}</strong>
                  <span className="mono muted">
                    {r[1]}
                    {" / "}
                    {r[2]}
                  </span>
                </div>
                <div className="progress" style={css("height:6px")}>
                  <i style={css("width:" + (r[1] / r[2]) * 100 + "%")} />
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
