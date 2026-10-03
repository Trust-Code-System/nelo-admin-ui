import { EmptyResults } from "../components/EmptyResults";
import { filterRecords } from "../lib/records";
import type { AdminState } from "../types";
import { I, status, btn, control, pageHead } from "../components/presentation";
export function MeasurementsPage({ state }: { state: AdminState }) {
  return (
    <div className="page">
      {pageHead(
        "Atelier",
        "Measurement profiles",
        "View client measurements and review flagged profiles.",
        <>{btn("New profile")}</>,
      )}
      <div className="toolbar">
        <label className="search-field">
          {I("search")}
          <input
            type="search"
            aria-label="Search client or profile"
            placeholder="Search client or profile"
          />
        </label>
        {control("Needs review", "measurementStatus")}
        {btn("Import CSV", "upload", "ghost")}
      </div>
      <section className="measurement-panel">
        <div className="measurement-summary">
          <div>
            <strong>Profiles requiring attention</strong>
            <span>
              One value is outside the expected range and blocks a production
              snapshot.
            </span>
          </div>
          {status("1 review", "red")}
        </div>
        {filterRecords(
          [
            [
              "Ada Okafor",
              "Atelier measured",
              "24 Sep · Ajao",
              ["Bust 91.4", "Waist 72.2", "Hip 101.6"],
            ],
            [
              "Chioma Nwosu",
              "Client submitted",
              "23 Sep · Web",
              ["Bust 96.0", "Waist 78.5", "Hip 105.2"],
            ],
            [
              "Nneka Eze",
              "Atelier measured",
              "18 Sep · Bashir",
              ["Bust 88.9", "Waist 69.8", "Hip 98.3"],
            ],
            [
              "Lola Adeyemi",
              "Review required",
              "Today · Web",
              ["Bust 190.0", "Waist 76.4", "Hip 104.7"],
            ],
            [
              "Temi Adeola",
              "Atelier measured",
              "12 Sep · Ajao",
              ["Bust 86.2", "Waist 67.3", "Hip 95.8"],
            ],
            [
              "Zainab Olaniyi",
              "Client submitted",
              "10 Sep · Web",
              ["Bust 103.4", "Waist 84.0", "Hip 112.8"],
            ],
          ] as [string, string, string, string[]][],
          state,
        ).length ? (
          filterRecords(
            [
              [
                "Ada Okafor",
                "Atelier measured",
                "24 Sep · Ajao",
                ["Bust 91.4", "Waist 72.2", "Hip 101.6"],
              ],
              [
                "Chioma Nwosu",
                "Client submitted",
                "23 Sep · Web",
                ["Bust 96.0", "Waist 78.5", "Hip 105.2"],
              ],
              [
                "Nneka Eze",
                "Atelier measured",
                "18 Sep · Bashir",
                ["Bust 88.9", "Waist 69.8", "Hip 98.3"],
              ],
              [
                "Lola Adeyemi",
                "Review required",
                "Today · Web",
                ["Bust 190.0", "Waist 76.4", "Hip 104.7"],
              ],
              [
                "Temi Adeola",
                "Atelier measured",
                "12 Sep · Ajao",
                ["Bust 86.2", "Waist 67.3", "Hip 95.8"],
              ],
              [
                "Zainab Olaniyi",
                "Client submitted",
                "10 Sep · Web",
                ["Bust 103.4", "Waist 84.0", "Hip 112.8"],
              ],
            ] as [string, string, string, string[]][],
            state,
          ).map((r, i) => (
            <button
              className={"measurement-row " + (i === 3 ? "is-review" : "")}
              data-detail={r[0] + "'s profile"}
              key={i}
            >
              <span className="measurement-person">
                <span className="mini-avatar">
                  {r[0].split(" ").map((x) => x[0])}
                </span>
                <span>
                  <strong>{r[0]}</strong>
                  <span>{r[2]}</span>
                </span>
              </span>
              <span className="measurement-source">
                {status(
                  r[1],
                  i === 3 ? "red" : i === 1 || i === 5 ? "blue" : "green",
                )}
              </span>
              {r[3].map((m, index) => (
                <span className="measurement-value" key={index}>
                  <span>{m.split(" ")[0]}</span>
                  <strong>
                    {m.split(" ")[1]}
                    {" cm"}
                  </strong>
                </span>
              ))}
              <span className="chev">{I("chev")}</span>
            </button>
          ))
        ) : (
          <EmptyResults table={false} />
        )}
      </section>
    </div>
  );
}
