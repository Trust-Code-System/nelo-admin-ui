import type { Dispatch, SetStateAction, RefObject, MouseEvent } from "react";
import type { MenuState } from "../components/Menu";
import type { View } from "../types";
import { drawerLabels } from "../data/fixtures";
import { downloadCsv } from "../lib/records";
import type { useOperations } from "./useOperations";
export function useWorkspaceActions(
  operations: ReturnType<typeof useOperations>,
  setMenu: Dispatch<SetStateAction<MenuState | null>>,
  workspace: RefObject<HTMLElement | null>,
) {
  const { state, setState, navigate, openDrawer, setMessage } = operations;
  return function click(event: MouseEvent<HTMLElement>) {
    const button = (event.target as HTMLElement).closest<HTMLButtonElement>(
      "button",
    );
    if (!button) return;
    const data = button.dataset,
      text = button.textContent?.trim() || "";
    if (data.menu) {
      const rect = button.getBoundingClientRect();
      setMenu({
        key: data.menu,
        left: Math.max(8, Math.min(rect.right - 240, innerWidth - 248)),
        top: Math.max(8, Math.min(rect.bottom + 6, innerHeight - 320)),
      });
    } else if (data.view) navigate(data.view as View);
    else if (data.drawer) openDrawer(data.drawer);
    else if (
      data.detail ||
      data.toast ||
      button.classList.contains("cal-event")
    )
      openDrawer(
        "detail",
        data.detail ||
          data.toast?.replace(/^Opened\s*/, "") ||
          button.querySelector("strong")?.textContent ||
          text,
      );
    else if (data.assetMode)
      setState((previous) => ({
        ...previous,
        assetMode: data.assetMode as "grid" | "list",
      }));
    else if (data.profileMode)
      setState((previous) => ({
        ...previous,
        profileMode: data.profileMode!,
      }));
    else if (data.preference)
      setState((previous) => ({
        ...previous,
        profilePreferences: {
          ...previous.profilePreferences,
          [data.preference!]: !previous.profilePreferences[data.preference!],
        },
      }));
    else if (data.profileAction)
      setMessage(
        `${data.profileAction}. This action is a preview; account settings have not changed.`,
      );
    else if (data.action === "refresh") operations.refresh();
    else if (data.action === "export-day") operations.exportDay();
    else if (drawerLabels[text]) openDrawer(drawerLabels[text]);
    else if (text === "Export") {
      const rows = [...workspace.current!.querySelectorAll("table tr")].map(
        (row) =>
          [...row.querySelectorAll("th,td")].map(
            (cell) => cell.textContent || "",
          ),
      );
      downloadCsv(`nelo-demo-${state.view}.csv`, rows);
      setMessage("Visible demo records exported.");
    } else if (text === "Filters") {
      const rect = button.getBoundingClientRect();
      setMenu({
        key: state.view === "customers" ? "segment" : "status",
        left: Math.max(8, rect.right - 240),
        top: rect.bottom + 6,
      });
    } else if (button.closest(".segmented") && state.view === "calendar")
      setState((previous) => ({
        ...previous,
        calendarMode: text,
      }));
    else if (button.closest(".segmented") && state.view === "catalogue")
      setState((previous) => ({
        ...previous,
        catalogueMode: text,
      }));
  };
}
