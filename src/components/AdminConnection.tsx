import {
  createContext,
  useContext,
  useState,
  useRef,
  type ReactNode,
  type FormEvent,
} from "react";
import { AdminApi, type Channel, type CurrentUser } from "../lib/admin-api";
interface Connection {
  api: AdminApi;
  channel: Channel;
  user: CurrentUser;
}
const ConnectionContext = createContext<Connection | null>(null);
export const useAdminConnection = () => useContext(ConnectionContext);
export function AdminConnection({ children }: { children: ReactNode }) {
  const endpoint = import.meta.env.VITE_ADMIN_API_URL as string | undefined;
  const [user, setUser] = useState<CurrentUser | null>(null);
  const [channelId, setChannelId] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const apiRef = useRef<AdminApi | null>(null);
  const pending = useRef(false);
  if (!endpoint)
    return (
      <main className="admin-login">
        <section className="panel">
          <h1>Connect NELO administration</h1>
          <p>
            Set VITE_ADMIN_API_URL in .env.local to your backend Admin API
            endpoint, then restart the development server.
          </p>
        </section>
      </main>
    );
  const channel = user?.channels.find((c) => c.id === channelId);
  async function signIn(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (pending.current) return;
    pending.current = true;
    const form = event.currentTarget;
    const data = new FormData(form);
    setBusy(true);
    setError("");
    try {
      const api = new AdminApi(endpoint!);
      const current = await api.login(
        String(data.get("username")),
        String(data.get("password")),
      );
      apiRef.current = api;
      setChannelId(current.channels[0]?.id ?? "");
      setUser(current);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Sign-in failed.");
    } finally {
      form.reset();
      setBusy(false);
      pending.current = false;
    }
  }
  async function signOut() {
    if (pending.current) return;
    pending.current = true;
    setBusy(true);
    setError("");
    try {
      await apiRef.current?.logout();
    } catch {
      setError(
        "Signed out locally; the backend could not confirm session invalidation.",
      );
    } finally {
      apiRef.current = null;
      setUser(null);
      setChannelId("");
      setBusy(false);
      pending.current = false;
    }
  }
  if (!user)
    return (
      <main className="admin-login">
        <form onSubmit={signIn} className="panel">
          <img className="login-logo" src="/nelo-logo.png" alt="NELO" />
          <p className="login-eyebrow">ADMINISTRATION</p>
          <h1>Welcome back</h1>
          <p>Sign in to manage your shop and Atelier.</p>
          <label>
            Username
            <input
              name="username"
              autoComplete="username"
              required
              disabled={busy}
            />
          </label>
          <label>
            Password
            <input
              name="password"
              type="password"
              autoComplete="current-password"
              required
              disabled={busy}
            />
          </label>
          {error && <p role="alert">{error}</p>}
          <button className="btn" disabled={busy}>
            {busy ? "Signing in…" : "Sign in"}
          </button>
        </form>
      </main>
    );
  return (
    <>
      <div className="connection-bar">
        <span>Signed in as {user.identifier}</span>
        <label>
          Channel{" "}
          <select
            value={channelId}
            onChange={(e) => setChannelId(e.target.value)}
            disabled={busy}
          >
            {user.channels.map((c) => (
              <option key={c.id} value={c.id}>
                {c.code}
              </option>
            ))}
          </select>
        </label>
        <button className="btn" onClick={signOut} disabled={busy}>
          Sign out
        </button>
      </div>
      {error && <p role="alert">{error}</p>}
      {channel && apiRef.current ? (
        <ConnectionContext value={{ api: apiRef.current, channel, user }}>
          {children}
        </ConnectionContext>
      ) : (
        <p>No authorized channel is available for this administrator.</p>
      )}
    </>
  );
}
