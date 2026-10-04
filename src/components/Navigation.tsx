import { navGroups } from "../data/fixtures";
import { Icon } from "./Icon";
import type { View } from "../types";
export function Navigation({
  view,
  collapsed,
  navigate,
  onCollapse,
  identifier,
}: {
  identifier: string;
  view: View;
  collapsed: boolean;
  navigate: (view: View) => void;
  onCollapse: () => void;
}) {
  return (
    <>
      <div className="brand">
        <div className="brand-icon" aria-hidden="true">
          N
        </div>
        <img className="brand-logo" src="/nelo-logo.png" alt="NELO" />
        <div className="brand-copy">
          <span>Atelier operations</span>
        </div>
        <button
          className="collapse"
          onClick={onCollapse}
          aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          {collapsed ? "›" : "‹"}
        </button>
      </div>
      <div className="nav-scroll">
        {navGroups.map(([label, items]) => (
          <div className="nav-group" key={label}>
            <div className="nav-label">{label}</div>
            {items.map(([id, text, icon, badge]) => (
              <button
                className={`nav-item ${view === id ? "active" : ""}`}
                key={id}
                onClick={() => navigate(id as View)}
                aria-current={view === id ? "page" : undefined}
              >
                <span className="nav-icon">
                  <Icon name={icon} />
                </span>
                <span className="nav-text">{text}</span>
                {badge && !identifier && (
                  <span className="nav-badge">{badge}</span>
                )}
              </button>
            ))}
          </div>
        ))}
      </div>
      <button
        className={`profile ${view === "profile" ? "active" : ""}`}
        onClick={() => navigate("profile")}
        aria-label="Open your profile"
      >
        <div className="avatar">{identifier.slice(0, 2).toUpperCase()}</div>
        <div className="profile-copy">
          <strong>{identifier}</strong>
          <span>Your profile</span>
        </div>
      </button>
    </>
  );
}
