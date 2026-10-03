import { createContext, useContext } from "react";
import type { AdminState } from "./types";
export const AdminContext = createContext<AdminState | null>(null);
export function useAdminState() {
  const state = useContext(AdminContext);
  if (!state) throw new Error("Admin components require AdminContext");
  return state;
}
