import { I, status } from "./presentation";
import { useAdminState } from "../context";
export function ProfilePreferences() {
  const state = useAdminState();
  return (
    <div className="profile-pane account-grid">
      <section className="account-panel">
        <div className="account-panel-head">
          <div>
            <h2>Workspace preferences</h2>
            <p>Personal choices for this browser and operator account.</p>
          </div>
          <span className="mono muted">Auto-saved</span>
        </div>
        <div className="account-panel-body preference-list">
          {[
            [
              "atelierAlerts",
              "Atelier alerts",
              "Surface fittings, overdue work and measurement anomalies.",
            ],
            [
              "dailyDigest",
              "Daily studio brief",
              "Receive a concise Lagos studio summary at 08:30.",
            ],
            [
              "compactDensity",
              "Compact record density",
              "Show more rows in production and commerce tables.",
            ],
            [
              "motion",
              "Motion and transitions",
              "Keep short orientation and feedback animations enabled.",
            ],
          ].map((row, index) => (
            <div className="preference-row" key={index}>
              <div>
                <strong>{row[1]}</strong>
                <span>{row[2]}</span>
              </div>
              <button
                className={
                  "switch " + (state.profilePreferences[row[0]] ? "on" : "")
                }
                data-preference={row[0]}
                aria-label={"Toggle " + row[1]}
                aria-pressed={state.profilePreferences[row[0]]}
              />
            </div>
          ))}
        </div>
      </section>
      <div className="account-stack">
        <section className="account-panel">
          <div className="account-panel-head">
            <div>
              <h2>Operating context</h2>
              <p>Defaults used across schedules and reports.</p>
            </div>
          </div>
          <div className="account-panel-body">
            {[
              ["Timezone", "West Africa Time"],
              ["Currency", "NGN · Nigerian naira"],
              ["Date format", "24 Sep 2026"],
              ["Start of week", "Monday"],
            ].map((row, index) => (
              <div className="account-row" key={index}>
                <span>{row[0]}</span>
                <strong>{row[1]}</strong>
                <button
                  className="row-actions"
                  data-profile-action={row[0] + " preference opened"}
                  aria-label={"Change " + row[0]}
                >
                  {I("chev")}
                </button>
              </div>
            ))}
          </div>
        </section>
        <section className="account-panel">
          <div className="account-panel-head">
            <div>
              <h2>Quiet hours</h2>
              <p>Urgent operational alerts still come through.</p>
            </div>
            {status("20:00–07:00", "blue")}
          </div>
          <div className="account-panel-body">
            <div className="preference-row">
              <div>
                <strong>Pause routine notifications</strong>
                <span>
                  Reduce distractions outside normal Lagos studio hours.
                </span>
              </div>
              <button
                className={`switch ${state.profilePreferences.quietHours !== false ? "on" : ""}`}
                data-preference="quietHours"
                aria-label="Toggle quiet hours"
                aria-pressed={state.profilePreferences.quietHours !== false}
              />
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
