import { status } from "./presentation";
export const schedule = () => (
  <div className="schedule">
    {[
      [
        "10:30",
        "Fitting · Ada Okafor",
        "Studio 1 · NE-00241 · Bridal",
        "Confirmed",
        "green",
      ],
      [
        "12:00",
        "Consultation · Chioma Nwosu",
        "In-store · New commission",
        "Requested",
        "blue",
      ],
      [
        "14:30",
        "Follow-up · Nneka Eze",
        "Virtual · NE-00236 · Bespoke",
        "Confirmed",
        "green",
      ],
      [
        "16:00",
        "Fitting · Lola Adeyemi",
        "Customer location · NE-00229",
        "Unconfirmed",
        "amber",
      ],
    ].map((r, index) => (
      <div className="schedule-row" key={index}>
        <div className="schedule-time">{r[0]}</div>
        <div className="schedule-line">
          <i />
        </div>
        <div className="schedule-copy">
          <strong>{r[1]}</strong>
          <span>{r[2]}</span>
        </div>
        {status(r[3], r[4])}
      </div>
    ))}
  </div>
);
