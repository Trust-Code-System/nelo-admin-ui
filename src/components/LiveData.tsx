import {
  useEffect,
  useRef,
  useState,
  type ReactNode,
  type FormEvent,
} from "react";
import { useAdminConnection } from "./AdminConnection";
import { AdminApiError } from "../lib/admin-api";
export function useLiveData<T>(
  document: string,
  variables: Record<string, unknown> = {},
  enabled = true,
) {
  const { api, channel } = useAdminConnection()!;
  const key = JSON.stringify(variables);
  const [data, setData] = useState<T | null>(null),
    [error, setError] = useState(""),
    [loading, setLoading] = useState(true),
    [version, setVersion] = useState(0);
  useEffect(() => {
    let active = true;
    setData(null);
    setError("");
    setLoading(enabled);
    if (enabled)
      api
        .request<T>(document, JSON.parse(key), channel.token)
        .then((result) => {
          if (active) setData(result);
        })
        .catch((e) => {
          if (active)
            setError(
              e instanceof Error ? e.message : "The data could not be loaded.",
            );
        })
        .finally(() => {
          if (active) setLoading(false);
        });
    return () => {
      active = false;
    };
  }, [api, channel.token, document, key, version, enabled]);
  return { data, error, loading, reload: () => setVersion((v) => v + 1) };
}
export function can(permission: string) {
  return (permissions: string[]) =>
    permissions.includes("SuperAdmin") || permissions.includes(permission);
}
export function ReadState({
  loading,
  error,
}: {
  loading: boolean;
  error: string;
}) {
  return loading ? (
    <p role="status" className="live-notice">
      Loading…
    </p>
  ) : error ? (
    <p role="alert" className="live-error">
      {error}
    </p>
  ) : null;
}
export function Pager({
  skip,
  total,
  onPage,
}: {
  skip: number;
  total: number;
  onPage: (skip: number) => void;
}) {
  return (
    <div className="live-pager">
      <span>
        {total} records · Page {Math.floor(skip / 20) + 1}
      </span>
      <div>
        <button
          className="btn"
          disabled={skip === 0}
          onClick={() => onPage(Math.max(0, skip - 20))}
        >
          Previous
        </button>
        <button
          className="btn"
          disabled={skip + 20 >= total}
          onClick={() => onPage(skip + 20)}
        >
          Next
        </button>
      </div>
    </div>
  );
}
export function Table<T extends { id: string }>({
  rows,
  columns,
  onSelect,
}: {
  rows: T[];
  columns: { label: string; render: (row: T) => ReactNode }[];
  onSelect?: (row: T) => void;
}) {
  return (
    <div className="panel table-wrap">
      <table className="data-table">
        <thead>
          <tr>
            {columns.map((c) => (
              <th key={c.label}>{c.label}</th>
            ))}
            {onSelect && <th>Details</th>}
          </tr>
        </thead>
        <tbody>
          {rows.map((r) => (
            <tr key={r.id}>
              {columns.map((c) => (
                <td key={c.label}>{c.render(r)}</td>
              ))}
              {onSelect && (
                <td>
                  <button className="btn ghost" onClick={() => onSelect(r)}>
                    View details
                  </button>
                </td>
              )}
            </tr>
          ))}
          {!rows.length && (
            <tr>
              <td
                colSpan={columns.length + (onSelect ? 1 : 0)}
                className="live-empty"
              >
                No records in this channel.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
export interface Field {
  name: string;
  label: string;
  type?: string;
  value?: string;
  required?: boolean;
  options?: { value: string; label: string }[];
  hint?: string;
}
export function ActionForm({
  title,
  fields,
  onSave,
  onDone,
  submit = "Save changes",
}: {
  title: string;
  fields: Field[];
  onSave: (values: Record<string, string>) => Promise<unknown>;
  onDone: () => void;
  submit?: string;
}) {
  const [busy, setBusy] = useState(false),
    [error, setError] = useState(""),
    [blocked, setBlocked] = useState(false);
  const pending = useRef(false);
  async function save(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (pending.current || blocked) return;
    pending.current = true;
    setBusy(true);
    setError("");
    const form = event.currentTarget;
    const input = new FormData(form);
    const values = Object.fromEntries(
      fields.map((field) => [
        field.name,
        field.type === "multiple"
          ? input.getAll(field.name).map(String).join(",")
          : String(input.get(field.name) ?? ""),
      ]),
    );
    try {
      await onSave(values);
      form.reset();
      onDone();
    } catch (e) {
      setError(
        e instanceof Error ? e.message : "Update could not be confirmed.",
      );
      if (
        e instanceof AdminApiError &&
        [
          "NETWORK",
          "UNCERTAIN",
          "INTERNAL_SERVER_ERROR",
          "500",
          "502",
          "503",
          "504",
        ].includes(e.code)
      )
        setBlocked(true);
    } finally {
      pending.current = false;
      setBusy(false);
    }
  }
  return (
    <form className="live-form" onSubmit={save}>
      <h3>{title}</h3>
      <div className="live-fields">
        {fields.map((f) => (
          <label key={f.name}>
            {f.label}
            {f.options ? (
              <select
                name={f.name}
                multiple={f.type === "multiple"}
                defaultValue={
                  f.type === "multiple"
                    ? (f.value?.split(",") ?? [])
                    : (f.value ?? "")
                }
                required={f.required}
                disabled={busy || blocked}
              >
                {!f.required && f.type !== "multiple" && (
                  <option value="">None</option>
                )}
                {f.options.map((o) => (
                  <option key={o.value} value={o.value}>
                    {o.label}
                  </option>
                ))}
              </select>
            ) : f.type === "textarea" ? (
              <textarea
                name={f.name}
                defaultValue={f.value}
                required={f.required}
                disabled={busy || blocked}
              />
            ) : (
              <input
                name={f.name}
                type={f.type ?? "text"}
                defaultValue={f.value}
                required={f.required}
                disabled={busy || blocked}
                step={f.type === "number" ? "any" : undefined}
              />
            )}{" "}
            {f.hint && <small>{f.hint}</small>}
          </label>
        ))}
      </div>
      {error && (
        <p role="alert" className="live-error">
          {error}
        </p>
      )}
      {blocked && (
        <p>
          Refresh the current data to check whether the update completed before
          trying again.
        </p>
      )}
      <button className="btn primary" disabled={busy || blocked}>
        {busy ? "Saving…" : submit}
      </button>
    </form>
  );
}
export function Detail({
  title,
  onClose,
  children,
}: {
  title: string;
  onClose: () => void;
  children: ReactNode;
}) {
  return (
    <section className="panel live-detail">
      <div className="live-detail-head">
        <h2>{title}</h2>
        <button className="btn ghost" onClick={onClose}>
          Close details
        </button>
      </div>
      {children}
    </section>
  );
}
