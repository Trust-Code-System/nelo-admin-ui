import { useEffect, useRef, useState, type FormEvent } from "react";
import { LiveCalendar } from "../components/LiveCalendar";
import { useAdminConnection } from "../components/AdminConnection";
import type { Appointment, AppointmentStatus } from "../lib/admin-api";
const statuses: AppointmentStatus[] = [
  "requested",
  "confirmed",
  "completed",
  "cancelled",
  "noShow",
];
function time(a: Appointment) {
  return new Intl.DateTimeFormat(undefined, {
    dateStyle: "medium",
    timeStyle: "short",
    timeZone: a.timezone,
  }).format(new Date(a.startsAt));
}
export function ConnectedAppointments({
  calendar = false,
}: {
  calendar?: boolean;
}) {
  const connection = useAdminConnection()!;
  const { api, channel } = connection;
  const [rows, setRows] = useState<Appointment[]>([]);
  const [total, setTotal] = useState(0);
  const [skip, setSkip] = useState(0);
  const [status, setStatus] = useState<AppointmentStatus | "">("");
  const [selected, setSelected] = useState<Appointment | null>(null);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [revision, setRevision] = useState(0);
  const [uncertain, setUncertain] = useState(false);
  const mutationPending = useRef(false);
  const permitted =
    channel.permissions.includes("SuperAdmin") ||
    channel.permissions.includes("ManageAtelierAppointments");
  useEffect(() => {
    let active = true;
    setLoading(true);
    setError("");
    setSelected(null);
    setRows([]);
    if (!permitted) {
      setLoading(false);
      return;
    }
    (async () => {
      const result = await api.appointments(
        channel.token,
        calendar ? 0 : skip,
        status || undefined,
        calendar ? 50 : 20,
      );
      if (!calendar) return result;
      const items = [...result.items];
      while (items.length < result.totalItems && active) {
        const page = await api.appointments(
          channel.token,
          items.length,
          status || undefined,
          50,
        );
        if (!page.items.length)
          throw new Error(
            "The schedule changed while loading. Refresh appointments to load it again.",
          );
        items.push(...page.items);
      }
      return { ...result, items };
    })()
      .then((result) => {
        if (active) {
          setRows(result.items);
          setTotal(result.totalItems);
          setUncertain(false);
        }
      })
      .catch((e) => {
        if (active)
          setError(
            e instanceof Error
              ? e.message
              : "Appointments could not be loaded.",
          );
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [api, channel.token, skip, status, revision, permitted, calendar]);
  async function act(
    action: "confirm" | "reschedule" | "cancel" | "complete" | "noShow",
    startsAt?: string,
  ) {
    if (!selected || mutationPending.current || uncertain) return;
    if (action === "cancel" && !window.confirm("Cancel this appointment?"))
      return;
    mutationPending.current = true;
    setBusy(true);
    setError("");
    try {
      await api.transition(channel.token, action, selected.id, startsAt);
      setSelected(null);
      setRevision((r) => r + 1);
    } catch (e) {
      setUncertain(true);
      setError(
        `${e instanceof Error ? e.message : "The update could not be confirmed."} Refresh appointments to check the current status before trying another action.`,
      );
    } finally {
      setBusy(false);
      mutationPending.current = false;
    }
  }
  function reschedule(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const value = String(new FormData(event.currentTarget).get("startsAt"));
    const date = new Date(value);
    if (!Number.isFinite(date.getTime())) {
      setError("Enter a valid date and time.");
      return;
    }
    void act("reschedule", date.toISOString());
  }
  if (!permitted)
    return (
      <div className="page">
        {!calendar && <h2>Appointment requests</h2>}
        <p>
          Your current channel does not grant appointment management permission.
        </p>
      </div>
    );
  return (
    <div className="page" onClick={(e) => e.stopPropagation()}>
      {!calendar && <h2>Appointment requests</h2>}
      {!calendar && <p>Connected to Vendure · {channel.code}</p>}
      <div className="toolbar">
        <label>
          Status{" "}
          <select
            value={status}
            disabled={busy}
            onChange={(e) => {
              setSkip(0);
              setStatus(e.target.value as AppointmentStatus | "");
            }}
          >
            <option value="">All statuses</option>
            {statuses.map((s) => (
              <option key={s}>{s}</option>
            ))}
          </select>
        </label>
        <button
          className="btn"
          disabled={busy || loading}
          onClick={() => setRevision((r) => r + 1)}
        >
          Refresh appointments
        </button>
      </div>
      {error && <p role="alert">{error}</p>}
      {loading ? (
        <p role="status">Loading appointments…</p>
      ) : error && !rows.length ? null : calendar ? (
        <LiveCalendar rows={rows} onSelect={setSelected} />
      ) : (
        <section className="panel">
          <div className="table-wrap">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Client</th>
                  <th>Purpose</th>
                  <th>Date and time</th>
                  <th>Status</th>
                  <th>Details</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((a) => (
                  <tr key={a.id}>
                    <td>
                      {a.customer.firstName} {a.customer.lastName}
                    </td>
                    <td>{a.purpose}</td>
                    <td>
                      {time(a)} ({a.timezone})
                    </td>
                    <td>{a.status}</td>
                    <td>
                      <button
                        className="btn"
                        disabled={busy}
                        onClick={() => setSelected(a)}
                      >
                        View appointment
                      </button>
                    </td>
                  </tr>
                ))}
                {!rows.length && (
                  <tr>
                    <td colSpan={5}>No appointments in this channel.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </section>
      )}
      {!calendar && (
        <div className="toolbar">
          <button
            className="btn"
            disabled={busy || loading || skip === 0}
            onClick={() => setSkip((s) => Math.max(0, s - 20))}
          >
            Previous
          </button>
          <span>
            Page {Math.floor(skip / 20) + 1} · {total} appointments
          </span>
          <button
            className="btn"
            disabled={busy || loading || skip + 20 >= total}
            onClick={() => setSkip((s) => s + 20)}
          >
            Next
          </button>
        </div>
      )}
      {selected && (
        <section
          className="panel appointment-detail"
          aria-label="Appointment details"
        >
          <h2>
            {selected.customer.firstName} {selected.customer.lastName}
          </h2>
          <p>
            {selected.customer.emailAddress} ·{" "}
            {selected.customer.phoneNumber || "No phone number"}
          </p>
          <p>
            {selected.purpose} · {selected.context || "No commission context"} ·{" "}
            {selected.status}
          </p>
          <p>
            {time(selected)} ({selected.timezone})
          </p>
          <p>
            {selected.locationMode}:{" "}
            {selected.locationDetails || "No location details"}
          </p>
          <p>{selected.notes || "No notes"}</p>
          <div className="toolbar">
            {selected.status === "requested" && (
              <button
                className="btn"
                disabled={busy || uncertain}
                onClick={() => void act("confirm")}
              >
                Confirm appointment
              </button>
            )}
            {["requested", "confirmed"].includes(selected.status) && (
              <button
                className="btn"
                disabled={busy || uncertain}
                onClick={() => void act("cancel")}
              >
                Cancel appointment
              </button>
            )}
            {selected.status === "confirmed" &&
              new Date(selected.startsAt).getTime() <= Date.now() && (
                <>
                  <button
                    className="btn"
                    disabled={busy || uncertain}
                    onClick={() => void act("complete")}
                  >
                    Mark completed
                  </button>
                  <button
                    className="btn"
                    disabled={busy || uncertain}
                    onClick={() => void act("noShow")}
                  >
                    Mark no-show
                  </button>
                </>
              )}
            <button
              className="btn"
              disabled={busy}
              onClick={() => setSelected(null)}
            >
              Close details
            </button>
          </div>
          {["requested", "confirmed"].includes(selected.status) && (
            <form onSubmit={reschedule}>
              <label>
                New time (your browser's local timezone)
                <input
                  name="startsAt"
                  type="datetime-local"
                  required
                  disabled={busy || uncertain}
                />
              </label>
              <button className="btn" disabled={busy || uncertain}>
                Reschedule appointment
              </button>
            </form>
          )}
        </section>
      )}
    </div>
  );
}
