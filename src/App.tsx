import { useWorkspaceActions } from "./hooks/useWorkspaceActions";
import { useCallback, useEffect, useRef, useState } from "react";
import { AdminContext } from "./context";
import { useOperations } from "./hooks/useOperations";
import { Navigation } from "./components/Navigation";
import { Icon } from "./components/Icon";
import { Drawer } from "./components/Drawer";
import { CommandSearch } from "./components/CommandSearch";
import { Menu, type MenuState } from "./components/Menu";
import { SessionRecords } from "./components/SessionRecords";
import { drawerLabels, navGroups } from "./data/fixtures";
import { downloadCsv } from "./lib/records";
import { OverviewPage } from "./pages/OverviewPage";
import { CalendarPage } from "./pages/CalendarPage";
import { AppointmentsPage } from "./pages/AppointmentsPage";
import { CommissionsPage } from "./pages/CommissionsPage";
import { ProductionPage } from "./pages/ProductionPage";
import { MeasurementsPage } from "./pages/MeasurementsPage";
import { AssetsPage } from "./pages/AssetsPage";
import { OrdersPage } from "./pages/OrdersPage";
import { CustomersPage } from "./pages/CustomersPage";
import { CataloguePage } from "./pages/CataloguePage";
import { ProfilePage } from "./pages/ProfilePage";
import type { View } from "./types";
const pages = {
  overview: OverviewPage,
  calendar: CalendarPage,
  appointments: AppointmentsPage,
  commissions: CommissionsPage,
  production: ProductionPage,
  measurements: MeasurementsPage,
  assets: AssetsPage,
  orders: OrdersPage,
  customers: CustomersPage,
  catalogue: CataloguePage,
  profile: ProfilePage,
};
export function App() {
  const operations = useOperations();
  const {
    state,
    setState,
    drawer,
    command,
    mobile,
    setMobile,
    collapsed,
    setCollapsed,
    message,
    setMessage,
    navigate,
    openDrawer,
    closeDialog,
    filter,
  } = operations;
  const [menu, setMenu] = useState<MenuState | null>(null);
  const closeMenu = useCallback(() => setMenu(null), []);
  const workspace = useRef<HTMLElement>(null);
  const Page = pages[state.view];
  const label =
    navGroups
      .flatMap(([, items]) => items)
      .find(([id]) => id === state.view)?.[1] || "Profile";
  useEffect(() => {
    workspace.current?.scrollTo({
      top: 0,
    });
    document.title = `${label} · NELO Atelier Operations`;
    closeMenu();
  }, [state.view, label, closeMenu]);
  const click = useWorkspaceActions(operations, setMenu, workspace);
  const dialogOpen = !!drawer || command;
  return (
    <AdminContext value={state}>
      <a
        className="skip-link"
        href="#workspace"
        onClick={(event) => {
          event.preventDefault();
          workspace.current?.focus();
        }}
      >
        Skip to workspace
      </a>
      <div
        className={`app ${collapsed ? "collapsed" : ""}`}
        inert={dialogOpen}
        onClick={click}
      >
        <aside
          className={`sidebar ${mobile ? "open" : ""}`}
          aria-label="Primary navigation"
        >
          <Navigation
            view={state.view}
            collapsed={collapsed}
            navigate={navigate}
            onCollapse={() => setCollapsed((value) => !value)}
          />
        </aside>
        <div
          className={`mobile-scrim ${mobile ? "open" : ""}`}
          onClick={() => setMobile(false)}
        />
        <section className="shell">
          <header className="topbar">
            <button
              className="icon-btn mobile-menu"
              aria-label="Open navigation"
              aria-expanded={mobile}
              onClick={() => setMobile((value) => !value)}
            >
              <Icon name="menu" />
            </button>
            <div className="crumb">
              <span>Operations</span>
              <span>/</span>
              <b>{label}</b>
            </div>
            <button
              className="search-trigger"
              aria-label="Open global search"
              onClick={() => {
                closeDialog();
                operations.setCommand(true);
              }}
            >
              <Icon name="search" />
              <span>Search clients, commissions, orders…</span>
              <kbd className="kbd">⌘ K</kbd>
            </button>
            <div className="top-actions">
              <button className="control" data-menu="market">
                <span className="context-label">
                  {state.filters.market?.split(" · ")[0] || "Lagos studio"}
                </span>
                <span className="mono">
                  {state.filters.market?.split(" · ")[1] || "NGN"}
                </span>
              </button>
              <button
                className="icon-btn"
                data-menu="notifications"
                aria-label="Notifications"
              >
                <Icon name="bell" />
                <span className="notif-dot" />
              </button>
            </div>
          </header>
          <main
            className="workspace"
            id="workspace"
            tabIndex={-1}
            ref={workspace}
            onInput={(event) => {
              if (
                (event.target as HTMLInputElement).matches(
                  ".search-field input",
                )
              )
                filter("search", (event.target as HTMLInputElement).value);
            }}
          >
            <Page state={state} />
            <SessionRecords state={state} />
            {state.filters.search && (
              <p className="preview-label">
                Search results for “{state.filters.search}”
              </p>
            )}
            <p className="preview-label">
              Design preview · Demo records · Changes stay in this session
            </p>
          </main>
        </section>
      </div>
      {dialogOpen && <div className="backdrop open" onClick={closeDialog} />}
      {drawer && (
        <Drawer
          key={`${drawer.type}-${drawer.detail}`}
          drawer={drawer}
          onClose={closeDialog}
          onSave={operations.save}
          files={state.uploads}
          onFilesChange={(uploads) =>
            setState((previous) => ({ ...previous, uploads }))
          }
        />
      )}
      {command && (
        <CommandSearch
          onClose={closeDialog}
          navigate={navigate}
          openDrawer={openDrawer}
        />
      )}
      {menu && (
        <Menu
          menu={menu}
          selected={state.filters[menu.key]}
          onClose={closeMenu}
          onSelect={(value) => {
            if (menu.key === "notifications") openDrawer("detail", value);
            else filter(menu.key, value);
            closeMenu();
          }}
        />
      )}
      <div className="sr-only" role="status" aria-live="polite">
        {message}
      </div>
    </AdminContext>
  );
}
