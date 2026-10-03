import { I, css, status } from "./presentation";
import { useAdminState } from "../context";
export function ProfileOverview() {
  const state = useAdminState();
  return (
    <div className="profile-pane account-grid">
      <div className="account-stack">
        <section className="account-panel">
          <div className="account-panel-head">
            <div>
              <h2>Personal details</h2>
              <p>Your operator identity inside Nelo Atelier.</p>
            </div>
            <button className="link-btn" data-drawer="account">
              Edit details
            </button>
          </div>
          <div className="account-panel-body">
            {[
              ["Display name", "Ghost69"],
              ["Work email", "ghost69@neloatelier.com"],
              ["Phone", "+234 803 555 0198"],
              ["Primary studio", "Lagos · NGN"],
              ["Working hours", "Mon–Fri · 09:00–18:00"],
            ].map((row, index) => (
              <div className="account-row" key={index}>
                <span>{row[0]}</span>
                <strong>{row[1]}</strong>
                <button
                  className="row-actions"
                  data-drawer="account"
                  aria-label={"Edit " + row[0]}
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
              <h2>Recent activity</h2>
              <p>Changes attributed to this operator account.</p>
            </div>
            <span className="mono muted">Today</span>
          </div>
          <div className="account-panel-body activity-list">
            {[
              [
                "Commission moved to cutting",
                "Dewdrop bridal gown · NE-00241",
                "10:24",
              ],
              [
                "Measurement profile reviewed",
                "Lola Adeyemi · anomaly retained",
                "09:48",
              ],
              ["Appointment confirmed", "Ada Okafor · Studio 1", "09:12"],
              [
                "Production note added",
                "Midnight Jewel · NE-00237",
                "Yesterday",
              ],
            ].map((row, i) => (
              <div className="activity-item" key={i}>
                <i
                  style={css("background:" + (i === 1 ? "#a33a35" : "#790008"))}
                />
                <div>
                  <strong>{row[0]}</strong>
                  <span>{row[1]}</span>
                </div>
                <time>{row[2]}</time>
              </div>
            ))}
          </div>
        </section>
      </div>
      <div className="account-stack">
        <section className="account-panel">
          <div className="account-panel-head">
            <div>
              <h2>Access and role</h2>
              <p>Permissions follow the Lagos studio role.</p>
            </div>
            {status("Active", "green")}
          </div>
          <div className="account-panel-body permission-list">
            {[
              ["overview", "Operations lead", "Manage daily atelier workflows"],
              [
                "check",
                "Approval authority",
                "Confirm fittings and production stages",
              ],
              ["users", "Team access", "View Lagos studio operators"],
              ["image", "Sensitive assets", "Approved customer references"],
            ].map((row, index) => (
              <div className="permission-item" key={index}>
                <span className="permission-icon">{I(row[0])}</span>
                <div>
                  <strong>{row[1]}</strong>
                  <span>{row[2]}</span>
                </div>
              </div>
            ))}
          </div>
        </section>
        <section className="account-panel">
          <div className="account-panel-head">
            <div>
              <h2>Profile health</h2>
              <p>Account details and recovery readiness.</p>
            </div>
            <span className="mono">92%</span>
          </div>
          <div className="account-panel-body">
            <div style={css("padding:1rem 0")}>
              <div className="progress" style={css("height:5px")}>
                <i style={css("width:92%")} />
              </div>
              <p
                className="muted"
                style={css("margin:.65rem 0 0;font-size:.65rem")}
              >
                Add a recovery phone to complete account protection.
              </p>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
