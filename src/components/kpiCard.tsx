import { I } from "./presentation";
export const kpiCard = (
  icon: string,
  label: string,
  value: string,
  delta: string,
  visual: React.ReactNode,
  view: string,
) => (
  <button
    className="kpi-card interactive-card"
    data-view={view}
    aria-label={"Open " + label}
  >
    <div className="kpi-top">
      <span>
        {I(icon)}
        {label}
      </span>
      {delta && <span className="delta">{delta}</span>}
    </div>
    <div className="kpi-main">
      <strong className="kpi-value">{value}</strong>
      {visual}
    </div>
  </button>
);
