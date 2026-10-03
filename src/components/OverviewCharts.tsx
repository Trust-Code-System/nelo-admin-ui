import { css, control } from "./presentation";
export function OverviewCharts() {
  return (
    <div className="dashboard-main">
      <section className="overview-panel">
        <div className="overview-panel-head">
          <div>
            <h2>Production flow</h2>
            <p>Garments reaching their next stage this month.</p>
          </div>
          {control("September", "range")}
        </div>
        <div className="overview-panel-body">
          <div className="overview-chart">
            <svg
              viewBox="0 0 720 250"
              preserveAspectRatio="none"
              aria-label="Production flow rises from 18 to 87 percent"
            >
              <g className="chart-grid">
                <line x1="0" x2="720" y1="35" y2="35" />
                <line x1="0" x2="720" y1="95" y2="95" />
                <line x1="0" x2="720" y1="155" y2="155" />
                <line x1="0" x2="720" y1="215" y2="215" />
              </g>
              <path
                d="M0 210 C70 190 96 196 145 165 S232 166 282 131 S367 126 421 104 S512 96 568 65 S660 56 720 24 L720 230 L0 230Z"
                fill="#f5e4dd"
              />
              <path
                d="M0 210 C70 190 96 196 145 165 S232 166 282 131 S367 126 421 104 S512 96 568 65 S660 56 720 24"
                fill="none"
                stroke="#790008"
                strokeWidth="3"
              />
              <circle
                cx="421"
                cy="104"
                r="5"
                fill="#fff"
                stroke="#790008"
                strokeWidth="3"
              />
            </svg>
            <div className="chart-tooltip">
              <span>24 Sep</span>
              <strong>67%</strong>
              <small>+8% week on week</small>
            </div>
            <div className="chart-axis">
              <span>1 Sep</span>
              <span>8 Sep</span>
              <span>15 Sep</span>
              <span>22 Sep</span>
              <span>30 Sep</span>
            </div>
          </div>
        </div>
      </section>
      <section className="overview-panel">
        <div className="overview-panel-head">
          <div>
            <h2>Workload split</h2>
            <p>32 active garments by current stage.</p>
          </div>
        </div>
        <div className="overview-panel-body">
          <div className="workload-ring">
            <div className="workload-total">
              <span>Active</span>
              <strong>32</strong>
            </div>
          </div>
          <div className="legend">
            <span>
              <i style={css("background:#790008")} />
              Cutting 38%
            </span>
            <span>
              <i style={css("background:#d37d45")} />
              Sewing 25%
            </span>
            <span>
              <i style={css("background:#3c617e")} />
              Finishing 20%
            </span>
            <span>
              <i style={css("background:#c8c8c3")} />
              Fittings 17%
            </span>
          </div>
        </div>
      </section>
    </div>
  );
}
