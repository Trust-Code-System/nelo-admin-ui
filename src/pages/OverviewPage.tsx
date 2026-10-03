import { OverviewCharts } from "../components/OverviewCharts";
import type { AdminState } from "../types";
import {
  I,
  css,
  status,
  btn,
  control,
  kpiCard,
} from "../components/presentation";
export function OverviewPage({ state }: { state: AdminState }) {
  return (
    <div className="page overview-page">
      <section className="welcome-bar">
        <div className="welcome-copy">
          <div className="welcome-meta">
            Thursday · 24 September · Lagos studio
          </div>
          <h1>Good morning, Ghost69.</h1>
          <p>
            Five appointments and six active deadlines need attention today.
          </p>
        </div>
        <div className="welcome-actions">
          <span className="update-stamp" id="refreshStamp">
            Updated {state.refreshedAt}
          </span>
          {btn("Refresh data", "clock", "ghost", 'data-action="refresh"')}
          {btn("Export day", "upload", "ghost", 'data-action="export-day"')}
          {btn(
            "New appointment",
            "plus",
            "primary",
            'data-drawer="appointment"',
          )}
        </div>
      </section>
      <div className="dashboard-heading">
        <div>
          <h2>Highlights</h2>
          <p>Current atelier workload and service health.</p>
        </div>
      </div>
      <section className="dashboard-kpis">
        {kpiCard(
          "calendar",
          "Appointments today",
          "05",
          "+2 confirmed",
          <div className="mini-bars">
            <i style={css("height:35%")} />
            <i style={css("height:48%")} />
            <i style={css("height:65%")} />
            <i style={css("height:88%")} />
          </div>,
          "appointments",
        )}
        {kpiCard(
          "layers",
          "Due this week",
          "06",
          "71% on track",
          <div className="mini-spark">
            <svg viewBox="0 0 72 38">
              <path d="M2 32 L16 25 L29 27 L41 17 L55 14 L70 4" />
              <circle cx="70" cy="4" r="2" />
            </svg>
          </div>,
          "commissions",
        )}
        {kpiCard(
          "check",
          "Production ready",
          "07",
          "+3 since Monday",
          <div className="mini-bars">
            <i style={css("height:30%")} />
            <i style={css("height:55%")} />
            <i style={css("height:46%")} />
            <i style={css("height:78%")} />
          </div>,
          "production",
        )}
        {kpiCard(
          "clock",
          "Open requests",
          "03",
          "18% shorter wait",
          <div className="mini-spark">
            <svg viewBox="0 0 72 38">
              <path d="M2 7 L16 13 L29 11 L42 22 L55 21 L70 32" />
              <circle cx="70" cy="32" r="2" />
            </svg>
          </div>,
          "appointments",
        )}
      </section>
      <OverviewCharts />
      <div className="dashboard-lower">
        <section className="overview-panel">
          <div className="overview-panel-head">
            <div>
              <h2>Upcoming deadlines</h2>
              <p>The next commissions requiring handoff or review.</p>
            </div>
            <button className="link-btn" data-view="commissions">
              View workboard
            </button>
          </div>
          <div className="overview-panel-body">
            <div className="deadline-list">
              {[
                [
                  "Dewdrop bridal gown",
                  "Ada Okafor · NE-00241",
                  "28 Sep",
                  "Fitting",
                  "At risk",
                  "red",
                ],
                [
                  "Ivory silk set",
                  "Nneka Eze · NE-00238",
                  "30 Sep",
                  "Cutting",
                  "On track",
                  "green",
                ],
                [
                  "Midnight Jewel",
                  "Lola Adeyemi · NE-00237",
                  "02 Oct",
                  "Sewing",
                  "On track",
                  "green",
                ],
              ].map((r, index) => (
                <button className="deadline-row" data-detail={r[0]} key={index}>
                  <span className="deadline-copy">
                    <strong>{r[0]}</strong>
                    <span>{r[1]}</span>
                  </span>
                  <span className="deadline-date">{r[2]}</span>
                  <span>{r[3]}</span>
                  {status(r[4], r[5])}
                </button>
              ))}
            </div>
          </div>
        </section>
        <section className="overview-panel">
          <div className="overview-panel-head">
            <div>
              <h2>Quick actions</h2>
              <p>Common front desk and atelier tasks.</p>
            </div>
          </div>
          <div className="overview-panel-body">
            <div className="quick-grid">
              <button className="quick-action" data-drawer="appointment">
                {I("calendar")}
                New appointment
              </button>
              <button className="quick-action" data-drawer="commission">
                {I("layers")}
                New commission
              </button>
              <button className="quick-action" data-drawer="upload">
                {I("upload")}
                Upload files
              </button>
              <button className="quick-action" data-drawer="note">
                {I("plus")}
                Add production note
              </button>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
