import { formConfigs } from "../data/fixtures";
import type { AdminState } from "../types";
export function SessionRecords({ state }: { state: AdminState }) {
  const key: Record<string, string> = {
    appointments: "appointment",
    commissions: "commission",
    production: "note",
    measurements: "profile",
    orders: "order",
    customers: "client",
    catalogue: "product",
    profile: "account",
  };
  const type = key[state.view],
    records = state.records[type];
  if (state.view === "assets" && state.uploads.length)
    return (
      <section className="panel session-records">
        <div className="panel-head">
          <h2>Staged in this session</h2>
          <span className="muted">Local files</span>
        </div>
        <div className="panel-body">
          {state.uploads.map((file, index) => (
            <div className="detail-row" key={`${file.name}-${index}`}>
              <strong>{file.name}</strong>
              <span>{(file.size / 1024 / 1024).toFixed(1)} MB</span>
            </div>
          ))}
        </div>
      </section>
    );
  if (!records?.length) return null;
  return (
    <section className="panel session-records">
      <div className="panel-head">
        <h2>Added in this session</h2>
        <span className="muted">Local preview entries</span>
      </div>
      <div className="panel-body">
        {records.map((record, index) => (
          <div className="record-card" key={index}>
            {formConfigs[type].fields
              .filter(([name]) => record[name])
              .map(([name, label]) => (
                <div className="detail-row" key={name}>
                  <span>{label}</span>
                  <strong>{record[name]}</strong>
                </div>
              ))}
          </div>
        ))}
      </div>
    </section>
  );
}
