import { css } from "./presentation";
export const calendarWeekMarkup = () => (
  <div className="calendar-shell view-swap">
    <div className="cal-head mono">GMT+1</div>
    {["MON 21", "TUE 22", "WED 23", "THU 24", "FRI 25"].map((d, i) => (
      <div className={"cal-head cal-day " + (i === 3 ? "today" : "")} key={i}>
        <strong>{d.split(" ")[0]}</strong>
        <span>
          {d.split(" ")[1]}
          {" SEP"}
        </span>
      </div>
    ))}
    <div className="time-col">
      {[
        "09:00",
        "10:00",
        "11:00",
        "12:00",
        "13:00",
        "14:00",
        "15:00",
        "16:00",
      ].map((t, i) => (
        <span
          className="time-label"
          style={css("top:" + (i * 12.5 + 2) + "%")}
          key={i}
        >
          {t}
        </span>
      ))}
    </div>
    {[0, 1, 2, 3, 4].map((d, index) => (
      <div className="day-col" key={index}>
        {d === 0 ? (
          <>
            <button className="cal-event" style={css("top:10%;height:17%")}>
              <strong>Bridal fitting</strong>
              <span>10:05–11:25 · Ada</span>
            </button>
            <button
              className="cal-event green"
              style={css("top:53%;height:13%")}
            >
              <strong>Measurements</strong>
              <span>13:20–14:20 · Zainab</span>
            </button>
          </>
        ) : (
          ""
        )}
        {d === 1 ? (
          <button className="cal-event blue" style={css("top:36%;height:15%")}>
            <strong>Consultation</strong>
            <span>12:10–13:15 · Chioma</span>
          </button>
        ) : (
          ""
        )}
        {d === 2 ? (
          <button className="cal-event amber" style={css("top:22%;height:12%")}>
            <strong>Fabric review</strong>
            <span>10:55–12:00 · Nneka</span>
          </button>
        ) : (
          ""
        )}
        {d === 3 ? (
          <>
            <i className="now-line" style={css("top:34%")} />
            <button
              className="cal-event green"
              style={css("top:18%;height:14%")}
            >
              <strong>Fitting · Look 03</strong>
              <span>10:30–11:40 · Ada</span>
            </button>
            <button
              className="cal-event blue"
              style={css("top:62%;height:12%")}
            >
              <strong>Virtual follow-up</strong>
              <span>14:40–15:35 · Lola</span>
            </button>
          </>
        ) : (
          ""
        )}
        {d === 4 ? (
          <button className="cal-event" style={css("top:45%;height:15%")}>
            <strong>Bridal consultation</strong>
            <span>12:45–14:00 · Temi</span>
          </button>
        ) : (
          ""
        )}
      </div>
    ))}
  </div>
);
