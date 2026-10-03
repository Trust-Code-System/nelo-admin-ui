import type { AdminState } from "../types";
import { css } from "./presentation";
import { calendarModes } from "../data/fixtures";
export const calendarTabs = (state: AdminState) => (
  <div
    className="segmented is-slider"
    style={css(
      "--items:4;--active-index:" + calendarModes.indexOf(state.calendarMode),
    )}
  >
    {calendarModes.map((mode, index) => (
      <button
        className={state.calendarMode === mode ? "active" : ""}
        aria-pressed={state.calendarMode === mode}
        key={index}
      >
        {mode}
      </button>
    ))}
  </div>
);
