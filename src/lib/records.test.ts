import test from "node:test";
import assert from "node:assert/strict";
import { filterRecords, serializeCsv } from "./records.ts";
import type { AdminState } from "../types.ts";
const base: AdminState = {
  view: "appointments",
  assetMode: "grid",
  calendarMode: "Week",
  catalogueMode: "Products",
  profileMode: "Overview",
  profilePreferences: {},
  refreshedAt: "just now",
  filters: {},
  records: {},
  uploads: [],
};
test("Confirmed filter excludes Unconfirmed appointments", () => {
  const rows = [
    ["Ada", "Confirmed"],
    ["Lola", "Unconfirmed"],
    ["Temi", "Requested"],
  ];
  assert.deepEqual(
    filterRecords(rows, { ...base, filters: { status: "Confirmed" } }),
    [["Ada", "Confirmed"]],
  );
});
test("search and status filters combine without changing the source records", () => {
  const rows = [
    ["Ada", "Confirmed"],
    ["Ada", "Requested"],
    ["Temi", "Confirmed"],
  ];
  assert.deepEqual(
    filterRecords(rows, {
      ...base,
      filters: { search: " ADA ", status: "Confirmed" },
    }),
    [["Ada", "Confirmed"]],
  );
  assert.equal(rows.length, 3);
  assert.deepEqual(
    filterRecords(rows, { ...base, filters: { search: "unknown" } }),
    [],
  );
});
test("measurement review recognizes anomalous records and nested values", () => {
  const rows = [
    ["Ada", "Atelier measured", ["Bust 91.4"]],
    ["Lola", "Review required", ["Bust 190.0"]],
  ];
  assert.deepEqual(
    filterRecords(rows, {
      ...base,
      view: "measurements",
      filters: { measurementStatus: "Needs review" },
    }),
    [rows[1]],
  );
  assert.deepEqual(
    filterRecords(rows, {
      ...base,
      view: "measurements",
      filters: { search: "91.4" },
    }),
    [rows[0]],
  );
});
test("CSV preserves quotes and newlines and neutralizes spreadsheet formulas", () => {
  assert.equal(
    serializeCsv([
      ['Ada "Okafor"', "line one\nline two"],
      ["=1+1", "+SUM(A1)", "@command", "-1"],
    ]),
    '"Ada ""Okafor""","line one\nline two"\r\n"\'=1+1","\'+SUM(A1)","\'@command","\'-1"',
  );
});
