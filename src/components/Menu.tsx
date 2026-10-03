import { useEffect, useRef } from "react";
import { menus } from "../data/fixtures";
export interface MenuState {
  key: string;
  left: number;
  top: number;
}
export function Menu({
  menu,
  selected,
  onSelect,
  onClose,
}: {
  menu: MenuState;
  selected?: string;
  onSelect: (value: string) => void;
  onClose: () => void;
}) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    ref.current?.querySelector<HTMLButtonElement>("button")?.focus();
    const close = (event: Event) => {
      if (!ref.current?.contains(event.target as Node)) onClose();
    };
    window.addEventListener("pointerdown", close);
    window.addEventListener("resize", onClose);
    window.addEventListener("scroll", onClose, true);
    return () => {
      window.removeEventListener("pointerdown", close);
      window.removeEventListener("resize", onClose);
      window.removeEventListener("scroll", onClose, true);
    };
  }, [onClose]);
  const config = menus[menu.key];
  if (!config) return null;
  return (
    <div
      className="custom-menu"
      ref={ref}
      role="listbox"
      aria-label={config.label}
      style={{
        position: "fixed",
        width: 240,
        left: menu.left,
        top: menu.top,
      }}
      onKeyDown={(event) => {
        if (event.key === "Escape") {
          onClose();
        }
        if (event.key === "ArrowDown" || event.key === "ArrowUp") {
          event.preventDefault();
          const buttons = [
            ...ref.current!.querySelectorAll<HTMLButtonElement>("button"),
          ];
          const index = buttons.indexOf(
            document.activeElement as HTMLButtonElement,
          );
          buttons[
            (index + (event.key === "ArrowDown" ? 1 : -1) + buttons.length) %
              buttons.length
          ]?.focus();
        }
      }}
    >
      <div className="menu-label">{config.label}</div>
      {config.options.map((value) => (
        <button
          key={value}
          role="option"
          aria-selected={selected === value}
          onClick={() => onSelect(value)}
        >
          {value}
        </button>
      ))}
    </div>
  );
}
