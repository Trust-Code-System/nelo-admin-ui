import { useEffect, useState } from "react";
import {
  AdminConnection,
  useAdminConnection,
} from "./components/AdminConnection";
import { Icon } from "./components/Icon";
import { Navigation } from "./components/Navigation";
import type { View } from "./types";
import { ConnectedAppointments } from "./pages/ConnectedAppointments";
import { LiveCatalogue } from "./pages/LiveCatalogue";
import { LiveCustomers } from "./pages/LiveCustomers";
import { LiveAssets } from "./pages/LiveAssets";
import { LiveCommissions } from "./pages/LiveCommissions";
import { LiveMeasurements } from "./pages/LiveMeasurements";
import { LiveOrders } from "./pages/LiveOrders";
import { LiveOverview, LiveProfile } from "./pages/LiveOverview";
const navigation = [
  {
    label: "Workspace",
    items: [
      { id: "overview", name: "Overview", icon: "overview" },
      { id: "calendar", name: "Calendar", icon: "calendar" },
      { id: "appointments", name: "Appointments", icon: "clock" },
    ],
  },
  {
    label: "Atelier",
    items: [
      { id: "commissions", name: "Commissions", icon: "layers" },
      { id: "production", name: "Production", icon: "scissors" },
      { id: "measurements", name: "Measurements", icon: "ruler" },
    ],
  },
  {
    label: "Commerce",
    items: [
      { id: "catalogue", name: "Catalogue", icon: "box" },
      { id: "orders", name: "Orders", icon: "bag" },
      { id: "customers", name: "Customers", icon: "users" },
      { id: "assets", name: "Assets", icon: "image" },
    ],
  },
];
const views = new Set([
  ...navigation.flatMap((g) => g.items.map((i) => i.id)),
  "profile",
]);
function currentView() {
  const view = location.hash.slice(1);
  return views.has(view) ? view : "overview";
}
export function App() {
  return (
    <AdminConnection>
      <Workspace />
    </AdminConnection>
  );
}
function Workspace() {
  const { channel, user } = useAdminConnection()!;
  const [view, setView] = useState(currentView),
    [mobile, setMobile] = useState(false),
    [collapsed, setCollapsed] = useState(false);
  useEffect(() => {
    const update = () => {
      setView(currentView());
      setMobile(false);
    };
    window.addEventListener("hashchange", update);
    return () => window.removeEventListener("hashchange", update);
  }, []);
  const title =
    view === "profile"
      ? "Your profile"
      : (navigation.flatMap((g) => g.items).find((i) => i.id === view)?.name ??
        "Overview");
  useEffect(() => {
    document.title = `${title} · NELO Administration`;
  }, [title]);
  function navigate(id: string) {
    location.hash = id;
    setView(id);
    setMobile(false);
  }
  return (
    <div className={`app connected-workspace ${collapsed ? "collapsed" : ""}`}>
      <a
        className="skip-link"
        href="#workspace"
        onClick={(event) => {
          event.preventDefault();
          document.getElementById("workspace")?.focus();
        }}
      >
        Skip to workspace
      </a>
      <aside
        className={`sidebar ${mobile ? "open" : ""}`}
        aria-label="Primary navigation"
      >
        <Navigation
          view={view as View}
          collapsed={collapsed}
          navigate={navigate}
          onCollapse={() => setCollapsed((value) => !value)}
          identifier={user.identifier}
        />
      </aside>
      <button
        className={`mobile-scrim ${mobile ? "open" : ""}`}
        aria-label="Close navigation"
        onClick={() => setMobile(false)}
      />
      <section className="shell">
        <header className="topbar">
          <button
            className="icon-btn mobile-menu"
            aria-label="Open navigation"
            aria-expanded={mobile}
            onClick={() => setMobile(!mobile)}
          >
            <Icon name="menu" />
          </button>
          <div className="crumb">
            <span>Operations</span>
            <span>/</span>
            <b>{title}</b>
          </div>
          <div className="top-actions">
            <span className="control">
              <span className="context-label">{channel.code}</span>
            </span>
            <a
              className="ghost"
              href={
                new URL("/dashboard", import.meta.env.VITE_ADMIN_API_URL).href
              }
              target="_blank"
              rel="noreferrer"
            >
              Open Vendure <span aria-hidden="true">↗</span>
            </a>
          </div>
        </header>
        <main id="workspace" className="workspace live-main" tabIndex={-1}>
          <div className="page" key={`${channel.id}-${view}`}>
            {view !== "overview" && (
              <header className="page-head">
                <div>
                  <div className="eyebrow">
                    {navigation.find((g) => g.items.some((i) => i.id === view))
                      ?.label || "Account"}
                  </div>
                  <h1 className="page-title">
                    {view === "calendar" ? "Studio calendar" : title}
                  </h1>
                  <p className="page-sub">
                    Manage {title.toLowerCase()} in {channel.code}.
                  </p>
                </div>
              </header>
            )}
            {view === "overview" && <LiveOverview />}
            {(view === "calendar" || view === "appointments") && (
              <ConnectedAppointments calendar={view === "calendar"} />
            )}
            {view === "catalogue" && <LiveCatalogue />}
            {view === "customers" && <LiveCustomers />}
            {view === "assets" && <LiveAssets />}
            {view === "commissions" && <LiveCommissions />}
            {view === "production" && <LiveCommissions production />}
            {view === "measurements" && <LiveMeasurements />}
            {view === "orders" && <LiveOrders />}
            {view === "profile" && <LiveProfile />}
          </div>
        </main>
      </section>
    </div>
  );
}
