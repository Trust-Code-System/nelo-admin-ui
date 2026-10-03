import { CalendarContent } from "../components/CalendarContent";
import type { AdminState } from "../types";
import {
  btn,
  control,
  pageHead,
  calendarTabs,
} from "../components/presentation";
export function CalendarPage({ state }: { state: AdminState }) {
  return (
    <div className="page">
      {pageHead(
        "Atelier / Calendar",
        "Studio calendar",
        "Appointments, fittings and consultations for this week.",
        <>
          {control("Week", "range")}
          {btn("New appointment")}
        </>,
      )}
      <div className="toolbar">
        {calendarTabs(state)}
        {control("All appointment types", "appointmentType")}
        {control("All rooms", "room")}
      </div>
      <div className="calendar-scroll">{<CalendarContent state={state} />}</div>
    </div>
  );
}
