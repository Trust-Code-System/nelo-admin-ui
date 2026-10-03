import { I, css, status } from "./presentation";
import { useAdminState } from "../context";
export function ProfileSecurity() {
  const state = useAdminState();
  return (
    <div className="profile-pane account-grid">
      <div className="account-stack">
        <section className="account-panel">
          <div className="account-panel-head">
            <div>
              <h2>Sign-in security</h2>
              <p>Protect access to customer and measurement data.</p>
            </div>
            {status("Protected", "green")}
          </div>
          <div className="account-panel-body">
            {[
              ["Password", "Updated 36 days ago", "Change password"],
              [
                "Two-step verification",
                "Authenticator app enabled",
                "Manage 2FA",
              ],
              ["Recovery phone", "Not configured", "Add phone"],
            ].map((row, i) => (
              <div className="account-row" key={i}>
                <span>{row[0]}</span>
                <strong>{row[1]}</strong>
                <button
                  className="link-btn"
                  data-profile-action={row[2] + " opened"}
                >
                  {row[2]}
                </button>
              </div>
            ))}
          </div>
        </section>
        <section className="account-panel">
          <div className="account-panel-head">
            <div>
              <h2>Active sessions</h2>
              <p>Devices currently signed in to this account.</p>
            </div>
            <button
              className="link-btn"
              data-profile-action="Session review opened"
            >
              Review all
            </button>
          </div>
          <div className="account-panel-body">
            {[
              [
                "command",
                "Chrome on Windows",
                "Lagos · Current session · Just now",
              ],
              ["overview", "Safari on iPhone", "Lagos · 2 hours ago"],
            ].map((row, i) => (
              <div className="session-row" key={i}>
                <span className="session-mark">{I(row[0])}</span>
                <div>
                  <strong>{row[1]}</strong>
                  <span>{row[2]}</span>
                </div>
                {i === 0 ? (
                  status("This device", "green")
                ) : (
                  <button
                    className="link-btn"
                    data-profile-action="Session sign-out queued"
                  >
                    Sign out
                  </button>
                )}
              </div>
            ))}
          </div>
        </section>
      </div>
      <div className="account-stack">
        <section className="account-panel">
          <div className="account-panel-head">
            <div>
              <h2>Data access</h2>
              <p>Scope for sensitive customer information.</p>
            </div>
          </div>
          <div className="account-panel-body permission-list">
            {[
              ["users", "Customer records", "Read and update"],
              ["ruler", "Measurements", "Read, record and review"],
              ["image", "Reference assets", "View and upload"],
              ["bag", "Commerce", "View orders and refunds"],
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
              <h2>Security log</h2>
              <p>Recent account protection events.</p>
            </div>
          </div>
          <div className="account-panel-body activity-list">
            <div className="activity-item">
              <i style={css("background:#356c55")} />
              <div>
                <strong>Two-step challenge passed</strong>
                <span>Chrome on Windows · Lagos</span>
              </div>
              <time>09:02</time>
            </div>
            <div className="activity-item">
              <i style={css("background:#3c617e")} />
              <div>
                <strong>New session approved</strong>
                <span>Safari on iPhone · Lagos</span>
              </div>
              <time>22 Sep</time>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
