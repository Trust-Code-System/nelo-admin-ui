import type { CSSProperties, ReactNode } from "react";
import { Icon } from "./Icon";
import { useAdminState } from "../context";
export { kpiCard } from "./kpiCard";
export { rail } from "./rail";
export { schedule } from "./schedule";
export { calendarWeekMarkup } from "./calendarWeekMarkup";
export { calendarTabs } from "./calendarTabs";
export const I = (name: string) => <Icon name={name} />;
export function css(value: string): CSSProperties {
  return Object.fromEntries(
    value
      .split(";")
      .filter(Boolean)
      .map((rule) => {
        const colon = rule.indexOf(":");
        const name = rule.slice(0, colon).trim();
        return [
          name.startsWith("--")
            ? name
            : name.replace(/-([a-z])/g, (_, letter: string) =>
                letter.toUpperCase(),
              ),
          rule.slice(colon + 1).trim(),
        ];
      }),
  );
}
export const status = (text: string, color: string) => (
  <span className={`status ${color}`}>{text}</span>
);
export function btn(
  text: string,
  icon = "plus",
  className = "primary",
  attributes = "",
) {
  const data = Object.fromEntries(
    [...attributes.matchAll(/([\w-]+)="([^"]*)"/g)].map((match) => [
      match[1],
      match[2],
    ]),
  );
  return (
    <button className={className} {...data}>
      <Icon name={icon} />
      <span>{text}</span>
    </button>
  );
}
function Control({
  text,
  menu,
  icon,
}: {
  text: string;
  menu: string;
  icon: string;
}) {
  const state = useAdminState();
  return (
    <button className="control" data-menu={menu}>
      <span>{state.filters[menu] || text}</span>
      <Icon name={icon} />
    </button>
  );
}
export const control = (text: string, menu: string, icon = "down") => (
  <Control text={text} menu={menu} icon={icon} />
);
export const pageHead = (
  eyebrow: string,
  title: string,
  subtitle: string,
  actions: ReactNode = null,
) => (
  <div className="page-head">
    <div>
      <div className="eyebrow">{eyebrow}</div>
      <h1 className="page-title">{title}</h1>
      <p className="page-sub">{subtitle}</p>
    </div>
    <div className="head-actions">{actions}</div>
  </div>
);
