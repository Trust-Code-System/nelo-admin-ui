import { useState } from "react";
import { navGroups } from "../data/fixtures";
import { Icon } from "./Icon";
import { useDialogFocus } from "../hooks/useDialogFocus";
import type { View } from "../types";
export function CommandSearch({
  onClose,
  navigate,
  openDrawer,
}: {
  onClose: () => void;
  navigate: (view: View) => void;
  openDrawer: (type: string) => void;
}) {
  const [query, setQuery] = useState("");
  const ref = useDialogFocus(onClose);
  const items = [
    ...navGroups.flatMap(([, items]) => items),
    ["profile", "Operator profile", "users"],
  ];
  return (
    <div
      className="command open"
      role="dialog"
      aria-modal="true"
      aria-label="Search NELO operations"
      ref={ref}
    >
      <div className="command-search">
        <Icon name="search" />
        <input
          aria-label="Search NELO operations"
          placeholder="Search NELO operations…"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
        />
        <button
          className="icon-btn"
          onClick={onClose}
          aria-label="Close search"
        >
          <Icon name="x" />
        </button>
      </div>
      <div className="command-list">
        <div className="menu-label">Jump to</div>
        {items
          .filter(([, name]) =>
            name.toLowerCase().includes(query.toLowerCase()),
          )
          .map(([id, name, icon]) => (
            <button
              className="command-item"
              key={id}
              onClick={() => navigate(id as View)}
            >
              <Icon name={icon} />
              <span>{name}</span>
              <kbd>Open</kbd>
            </button>
          ))}
        <div className="menu-label">Quick actions</div>
        {[
          ["appointment", "Create appointment"],
          ["upload", "Upload atelier files"],
        ]
          .filter(([, label]) =>
            label.toLowerCase().includes(query.toLowerCase()),
          )
          .map(([type, label]) => (
            <button
              className="command-item"
              key={type}
              onClick={() => openDrawer(type)}
            >
              <Icon name="plus" />
              <span>{label}</span>
            </button>
          ))}
      </div>
    </div>
  );
}
