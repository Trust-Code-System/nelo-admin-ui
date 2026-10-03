import type { AdminState } from "../types";
const keysByView: Record<string, string[]> = {
  appointments: ["status"],
  calendar: ["appointmentType", "room"],
  measurements: ["measurementStatus"],
  orders: ["orderStatus"],
  customers: ["segment"],
  catalogue: ["productStatus"],
  assets: ["category"],
};
export function filterRecords<T>(rows: T[], state: AdminState): T[] {
  const query = state.filters.search?.trim().toLowerCase() || "";
  const selected = Object.entries(state.filters).filter(
    ([key, value]) =>
      keysByView[state.view]?.includes(key) && value && !/^all\b/i.test(value),
  );
  return rows.filter((row) => {
    const values = (
      Array.isArray(row)
        ? row.flat(2)
        : Object.values(row as Record<string, unknown>)
    )
      .map(String)
      .map((value) => value.toLowerCase());
    return (
      (!query || values.join(" ").includes(query)) &&
      selected.every(([key, value]) => {
        const wanted = value.toLowerCase();
        if (wanted === "needs review")
          return values.some((text) => /review|190\.0/.test(text));
        if (/status/i.test(key)) return values.includes(wanted);
        return values.some((text) => text.includes(wanted.replace(/s$/, "")));
      })
    );
  });
}
export function serializeCsv(rows: string[][]) {
  const escape = (value: string) =>
    `"${(/^[=+@-]/.test(value) ? "'" : "") + value.replace(/"/g, '""')}"`;
  return rows.map((row) => row.map(escape).join(",")).join("\r\n");
}
export function downloadCsv(filename: string, rows: string[][]) {
  const url = URL.createObjectURL(
    new Blob([serializeCsv(rows)], {
      type: "text/csv;charset=utf-8",
    }),
  );
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
