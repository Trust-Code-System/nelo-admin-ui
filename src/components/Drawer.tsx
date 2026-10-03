import { DatePicker } from "./DatePicker";
import { useState } from "react";
import { formConfigs, jobs } from "../data/fixtures";
import { Icon } from "./Icon";
import { useDialogFocus } from "../hooks/useDialogFocus";
import type { DrawerState } from "../types";
import { FileStaging } from "./FileStaging";
export function Drawer({
  drawer,
  onClose,
  onSave,
  files,
  onFilesChange,
}: {
  drawer: DrawerState;
  onClose: () => void;
  onSave: (type: string, data: Record<string, string>) => void;
  files: File[];
  onFilesChange: (files: File[]) => void;
}) {
  const ref = useDialogFocus(onClose);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");
  const config = formConfigs[drawer.type];
  const title =
    drawer.type === "detail"
      ? drawer.detail || "Atelier record"
      : drawer.type === "upload"
        ? "Add reference files"
        : drawer.type === "csv"
          ? "Import measurement CSV"
          : config?.title || "Atelier record";
  const job = jobs.find((row) => drawer.detail?.includes(row[2]));
  const details = job
    ? [
        ["Client", job[1]],
        ["Reference", job[0]],
        ["Target", job[3]],
        ["Maker", job[4]],
      ]
    : [
        ["Studio", "Lagos"],
        ["Data source", "Demonstration fixture"],
        ["Record", drawer.detail || "Atelier preview"],
      ];
  return (
    <div
      className="drawer open"
      role="dialog"
      aria-modal="true"
      aria-labelledby="drawer-title"
      ref={ref}
    >
      <div className="drawer-head">
        <div>
          <div className="eyebrow">
            {config?.eyebrow || "Atelier / Preview"}
          </div>
          <h2 id="drawer-title">{title}</h2>
        </div>
        <button
          className="icon-btn"
          aria-label="Close drawer"
          onClick={onClose}
        >
          <Icon name="x" />
        </button>
      </div>
      <div className="drawer-body">
        <p className="form-note">
          Frontend preview only. Entries and files stay in this browser session
          until the backend is connected.
        </p>
        {saved ? (
          <div className="form-success" role="status">
            <strong>
              {drawer.type === "csv"
                ? "CSV validated"
                : drawer.type === "upload"
                  ? "Files staged locally"
                  : "Saved locally"}
            </strong>
            <span>
              {drawer.type === "csv"
                ? "Header validation completed. No profiles were imported."
                : "Your entry is available in this session."}
            </span>
            <button className="primary" onClick={onClose}>
              Close
            </button>
          </div>
        ) : drawer.type === "upload" || drawer.type === "csv" ? (
          <FileStaging
            type={drawer.type}
            initialFiles={drawer.type === "upload" ? files : []}
            onFilesChange={onFilesChange}
            onSaved={() => setSaved(true)}
          />
        ) : drawer.type === "detail" ? (
          <>
            <div className="detail-hero">
              <span>Preview record</span>
              <strong>{drawer.detail}</strong>
            </div>
            <div className="detail-list">
              {details.map(([label, value]) => (
                <div className="detail-row" key={label}>
                  <span>{label}</span>
                  <strong>{value}</strong>
                </div>
              ))}
            </div>
            <div className="detail-actions">
              <button className="ghost" onClick={onClose}>
                Back to workspace
              </button>
              <button className="primary" onClick={onClose}>
                Done
              </button>
            </div>
          </>
        ) : (
          config && (
            <form
              className="drawer-form"
              onSubmit={(event) => {
                event.preventDefault();
                const data = Object.fromEntries(
                  [...new FormData(event.currentTarget)].map(([key, value]) => [
                    key,
                    String(value),
                  ]),
                );
                const missing = config.fields.find(
                  ([name, , type]) => type === "date" && !data[name],
                );
                if (missing) {
                  setError(`Choose ${missing[1].toLowerCase()} to continue.`);
                  return;
                }
                setError("");
                onSave(drawer.type, data);
                setSaved(true);
              }}
            >
              <div className="form-grid">
                {config.fields.map(([name, label, type, placeholder]) => (
                  <div
                    className={`field ${type === "textarea" ? "full" : ""}`}
                    key={name}
                  >
                    <label htmlFor={`field-${name}`}>{label}</label>
                    {type === "date" ? (
                      <DatePicker name={name} label={label} />
                    ) : type === "textarea" ? (
                      <textarea
                        id={`field-${name}`}
                        name={name}
                        placeholder={placeholder}
                      />
                    ) : (
                      <input
                        id={`field-${name}`}
                        name={name}
                        type={type}
                        placeholder={placeholder}
                        step={type === "number" ? "any" : undefined}
                        min={type === "number" ? 0 : undefined}
                        required={[
                          "client",
                          "name",
                          "reference",
                          "date",
                          "time",
                        ].includes(name)}
                      />
                    )}
                  </div>
                ))}
              </div>
              {error && (
                <p className="dialog-error" role="alert">
                  {error}
                </p>
              )}
              <button className="primary" type="submit">
                <Icon name="check" />
                <span>{config.submit}</span>
              </button>
            </form>
          )
        )}
      </div>
    </div>
  );
}
