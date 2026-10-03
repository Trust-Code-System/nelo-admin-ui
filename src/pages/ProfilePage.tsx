import { ProfileSecurity } from "../components/ProfileSecurity";
import { ProfilePreferences } from "../components/ProfilePreferences";
import { ProfileOverview } from "../components/ProfileOverview";
import type { AdminState } from "../types";
import { css, btn } from "../components/presentation";
export function ProfilePage({ state }: { state: AdminState }) {
  const profileTabs = () => (
    <div
      className="segmented is-slider profile-tabs"
      style={css(
        "--items:3;--active-index:" +
          ["Overview", "Preferences", "Security"].indexOf(state.profileMode),
      )}
      aria-label="Profile sections"
    >
      {["Overview", "Preferences", "Security"].map((mode, index) => (
        <button
          className={state.profileMode === mode ? "active" : ""}
          data-profile-mode={mode}
          aria-pressed={state.profileMode === mode}
          key={index}
        >
          {mode}
        </button>
      ))}
    </div>
  );
  const profilePane = () =>
    state.profileMode === "Preferences" ? (
      <ProfilePreferences />
    ) : state.profileMode === "Security" ? (
      <ProfileSecurity />
    ) : (
      <ProfileOverview />
    );
  return (
    <div className="page profile-page">
      <section className="profile-hero">
        <div className="profile-identity">
          <div className="profile-monogram">
            GA
            <span className="profile-presence" aria-label="Available" />
          </div>
          <div>
            <div className="profile-kicker">Operator profile</div>
            <h1 className="profile-name">Ghost69.</h1>
            <p className="profile-role">
              <strong>Operations lead</strong>
              {" · Lagos studio"}
            </p>
          </div>
        </div>
        <aside className="profile-context">
          <div className="profile-context-head">
            <span>Today at the atelier</span>
            <i title="Available" />
          </div>
          <dl>
            <dt>Shift</dt>
            <dd>09:00–18:00</dd>
            <dt>Appointments</dt>
            <dd>05 today</dd>
            <dt>Open approvals</dt>
            <dd>03</dd>
            <dt>Last active</dt>
            <dd>Just now</dd>
          </dl>
        </aside>
      </section>
      <div className="profile-bar">
        {profileTabs()}
        <div className="profile-actions">
          {btn("Edit profile", "users", "ghost", 'data-drawer="account"')}
          {btn(
            "View activity",
            "clock",
            "primary",
            'data-profile-mode="Overview"',
          )}
        </div>
      </div>
      <div id="profilePane">{profilePane()}</div>
    </div>
  );
}
