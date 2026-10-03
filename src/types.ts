export type View =
  | "overview"
  | "calendar"
  | "appointments"
  | "commissions"
  | "production"
  | "measurements"
  | "assets"
  | "orders"
  | "customers"
  | "catalogue"
  | "profile";
export interface AdminState {
  view: View;
  assetMode: "grid" | "list";
  calendarMode: string;
  catalogueMode: string;
  profileMode: string;
  profilePreferences: Record<string, boolean>;
  refreshedAt: string;
  filters: Record<string, string>;
  records: Record<string, Record<string, string>[]>;
  uploads: File[];
}
export interface DrawerState {
  type: string;
  detail?: string;
}
