import { useRef, useState, type FormEvent } from "react";
import { useAdminConnection } from "../components/AdminConnection";
import { Pager, ReadState, useLiveData, can } from "../components/LiveData";
import { documents, type Asset, type Page } from "../lib/operations";
export function LiveAssets() {
  const { api, channel } = useAdminConnection()!;
  const [skip, setSkip] = useState(0),
    [error, setError] = useState(""),
    [busy, setBusy] = useState(false);
  const pending = useRef(false);
  const [blocked, setBlocked] = useState(false);
  const list = useLiveData<{ assets: Page<Asset> }>(
    documents.assets,
    { options: { skip, take: 20, sort: { createdAt: "DESC" } } },
    can("ReadAsset")(channel.permissions),
  );
  async function upload(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (pending.current || blocked) return;
    const form = e.currentTarget;
    const file = new FormData(form).get("file");
    if (!(file instanceof File) || !file.size) return;
    pending.current = true;
    setBusy(true);
    setError("");
    try {
      await api.upload(channel.token, file);
      form.reset();
      list.reload();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Upload could not be confirmed.",
      );
      setBlocked(true);
    } finally {
      pending.current = false;
      setBusy(false);
    }
  }
  return (
    <>
      <div className="live-toolbar">
        <button
          className="btn"
          onClick={() => {
            list.reload();
          }}
        >
          Refresh assets
        </button>
      </div>
      <ReadState loading={list.loading} error={list.error} />
      {can("CreateAsset")(channel.permissions) && (
        <form className="live-form" onSubmit={upload}>
          <h3>Upload asset</h3>
          <label>
            Image or document
            <input
              type="file"
              name="file"
              required
              disabled={busy || blocked}
            />
          </label>
          <button className="btn primary" disabled={busy || blocked}>
            {busy ? "Uploading…" : "Upload"}
          </button>
          {error && (
            <p className="live-error" role="alert">
              {error}
            </p>
          )}
          {blocked && (
            <p>
              Review the asset list before reloading this page to retry an
              uncertain upload.
            </p>
          )}
        </form>
      )}
      {list.data && (
        <>
          <div className="live-product-grid">
            {list.data.assets.items.map((a) => (
              <article key={a.id} className="live-product-card">
                {a.mimeType.startsWith("image/") ? (
                  <img src={a.preview} alt={a.name} />
                ) : (
                  <div className="live-image-placeholder">Document</div>
                )}
                <div>
                  <h3>{a.name}</h3>
                  <p>
                    {a.mimeType} · {Math.ceil(a.fileSize / 1024)} KB
                  </p>
                  <a href={a.source} target="_blank" rel="noreferrer">
                    Open file
                  </a>
                </div>
              </article>
            ))}
          </div>
          {!list.data.assets.items.length && (
            <p className="live-empty">No assets in this channel.</p>
          )}
          <Pager
            skip={skip}
            total={list.data.assets.totalItems}
            onPage={setSkip}
          />
        </>
      )}
    </>
  );
}
