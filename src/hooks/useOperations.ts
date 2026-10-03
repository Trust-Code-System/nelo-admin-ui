import { useCallback, useEffect, useState } from "react";
import { apptRows, navGroups } from "../data/fixtures";
import { downloadCsv } from "../lib/records";
import type { AdminState, DrawerState, View } from "../types";
const views = new Set([
  ...navGroups.flatMap(([, items]) => items.map(([id]) => id)),
  "profile",
]);
export function routeFromHash(): View {
  const value = location.hash.slice(1).split("?")[0];
  return views.has(value) ? (value as View) : "overview";
}
export function useOperations() {
  const [state, setState] = useState<AdminState>({
    view: routeFromHash(),
    assetMode: "grid",
    calendarMode: "Week",
    catalogueMode: "Products",
    profileMode: "Overview",
    profilePreferences: {
      atelierAlerts: true,
      dailyDigest: true,
      compactDensity: false,
      motion: true,
      quietHours: true,
    },
    refreshedAt: "just now",
    filters: {},
    records: {},
    uploads: [],
  });
  const [drawer, setDrawer] = useState<DrawerState | null>(null);
  const [command, setCommand] = useState(false);
  const [mobile, setMobile] = useState(false);
  const [collapsed, setCollapsed] = useState(false);
  const [message, setMessage] = useState("");
  const navigate = useCallback((view: View) => {
    if (!views.has(view)) return;
    location.hash = view;
    setState((previous) => ({
      ...previous,
      view,
      filters: {},
    }));
    setMobile(false);
    setCommand(false);
    setDrawer(null);
  }, []);
  const closeDialog = useCallback(() => {
    setDrawer(null);
    setCommand(false);
  }, []);
  const openDrawer = useCallback((type: string, detail?: string) => {
    setCommand(false);
    setDrawer({
      type,
      detail,
    });
  }, []);
  const filter = useCallback(
    (key: string, value: string) =>
      setState((previous) => ({
        ...previous,
        filters: {
          ...previous.filters,
          [key]: value,
        },
      })),
    [],
  );
  useEffect(() => {
    const hash = () =>
      setState((previous) => ({
        ...previous,
        view: routeFromHash(),
        filters: {},
      }));
    const keydown = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        setDrawer(null);
        setCommand((value) => !value);
      }
      if (event.key === "Escape") {
        closeDialog();
        setMobile(false);
      }
    };
    window.addEventListener("hashchange", hash);
    window.addEventListener("keydown", keydown);
    return () => {
      window.removeEventListener("hashchange", hash);
      window.removeEventListener("keydown", keydown);
    };
  }, [closeDialog]);
  const save = (type: string, record: Record<string, string>) =>
    setState((previous) => ({
      ...previous,
      records: {
        ...previous.records,
        [type]: [...(previous.records[type] || []), record],
      },
    }));
  const refresh = () => {
    setState((previous) => ({
      ...previous,
      refreshedAt: new Intl.DateTimeFormat("en-NG", {
        hour: "2-digit",
        minute: "2-digit",
        timeZone: "Africa/Lagos",
      }).format(new Date()),
    }));
    setMessage("Local preview refreshed. No backend connection is configured.");
  };
  const exportDay = () => {
    downloadCsv("nelo-demo-appointments.csv", [
      ["Client", "Purpose", "Date and time", "Location", "Status"],
      ...apptRows.map((row) => row.slice(1, 6)),
    ]);
    setMessage("Demo appointment CSV exported.");
  };
  return {
    state,
    setState,
    drawer,
    command,
    setCommand,
    mobile,
    setMobile,
    collapsed,
    setCollapsed,
    message,
    setMessage,
    navigate,
    closeDialog,
    openDrawer,
    filter,
    save,
    refresh,
    exportDay,
  };
}
