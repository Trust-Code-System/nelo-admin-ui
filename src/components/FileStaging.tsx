import { useState } from "react";
import { Icon } from "./Icon";
const allowed = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "application/pdf",
]);
export function FileStaging({
  type,
  onSaved,
  initialFiles = [],
  onFilesChange,
}: {
  type: "upload" | "csv";
  onSaved: () => void;
  initialFiles?: File[];
  onFilesChange: (files: File[]) => void;
}) {
  const [files, setFiles] = useState<File[]>(initialFiles);
  const [error, setError] = useState("");
  const [preview, setPreview] = useState("");
  const csv = type === "csv";
  async function select(selected: File[]) {
    setError("");
    setPreview("");
    const valid = selected.filter(
      (file) =>
        file.size <= 20 * 1024 * 1024 &&
        (csv
          ? file.name.toLowerCase().endsWith(".csv")
          : allowed.has(file.type)),
    );
    setFiles(valid);
    if (!csv) onFilesChange(valid);
    if (valid.length !== selected.length)
      setError("Use the listed file formats and keep each file below 20 MB.");
    if (csv && valid[0]) {
      const text = await valid[0].text();
      const lines = text.trim().split(/\r?\n/);
      const headers = lines[0]
        .toLowerCase()
        .split(",")
        .map((value) => value.trim().replace(/^"|"$/g, ""));
      if (
        !["client", "bust", "waist", "hip"].every((name) =>
          headers.includes(name),
        )
      ) {
        setError("The CSV must contain client, bust, waist and hip columns.");
        setFiles([]);
        return;
      }
      setPreview(
        `${Math.max(0, lines.length - 1)} data rows ready for local staging.`,
      );
    }
  }
  return (
    <form
      className="drawer-form"
      onSubmit={(event) => {
        event.preventDefault();
        if (!files.length) {
          setError("Choose a file to continue.");
          return;
        }
        onSaved();
      }}
    >
      <input
        className="file-input"
        id="staging-files"
        type="file"
        multiple={!csv}
        accept={
          csv
            ? ".csv,text/csv"
            : "image/jpeg,image/png,image/webp,application/pdf"
        }
        onChange={(event) => void select([...(event.target.files || [])])}
      />
      <label className="drop-zone" htmlFor="staging-files">
        <Icon name="upload" />
        <span>
          <strong>
            {csv ? "Choose a CSV file" : "Choose reference files"}
          </strong>
          <span>
            {csv
              ? "Expected columns: client, bust, waist, hip"
              : "JPG, PNG, WEBP or PDF · 20 MB each"}
          </span>
        </span>
      </label>
      <div className={files.length ? "upload-list" : "upload-empty"}>
        {files.length
          ? files.map((file, index) => (
              <div className="upload-row" key={`${file.name}-${index}`}>
                <div className="file-thumb" />
                <div className="file-copy">
                  <strong>{file.name}</strong>
                  <span>{(file.size / 1024 / 1024).toFixed(1)} MB · Ready</span>
                </div>
                <button
                  className="row-actions"
                  type="button"
                  aria-label={`Remove ${file.name}`}
                  onClick={() => {
                    const next = files.filter((_, i) => i !== index);
                    setFiles(next);
                    if (!csv) onFilesChange(next);
                  }}
                >
                  <Icon name="x" />
                </button>
              </div>
            ))
          : "No files selected."}
      </div>
      {preview && <p role="status">{preview}</p>}
      {error && (
        <p className="dialog-error" role="alert">
          {error}
        </p>
      )}
      {!csv && (
        <div className="field">
          <label htmlFor="attachTo">Attach to</label>
          <input
            id="attachTo"
            name="attachTo"
            placeholder="Commission reference"
          />
        </div>
      )}
      <button className="primary" type="submit">
        <Icon name="check" />
        <span>{csv ? "Validate import" : "Add to staging queue"}</span>
      </button>
    </form>
  );
}
