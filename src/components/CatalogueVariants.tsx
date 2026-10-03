import { status } from "./presentation";
import { useAdminState } from "../context";
import { filterRecords } from "../lib/records";
import { EmptyResults } from "./EmptyResults";
const variants = [
  ["Tokyo mini · Black", "Tokyo mini", "NL-LS26-001-BLK", "M", "8", "Live"],
  ["Tokyo mini · Ivory", "Tokyo mini", "NL-LS26-001-IVY", "L", "3", "Live"],
  [
    "Midnight Jewel · Wine",
    "Midnight Jewel",
    "NL-LS26-002-WNE",
    "S",
    "5",
    "Live",
  ],
  [
    "Santorini set · Sand",
    "Santorini set",
    "NL-LS26-003-SND",
    "M",
    "0",
    "Draft",
  ],
  ["Adele set · Black", "Adele set", "NL-LS26-005-BLK", "L", "2", "Review"],
];
export function CatalogueVariants() {
  const state = useAdminState(),
    rows = filterRecords(variants, state);
  return (
    <section className="panel">
      <div className="table-wrap">
        <table className="data-table">
          <thead>
            <tr>
              {["Variant", "Product", "SKU", "Size", "Inventory", "Status"].map(
                (label) => (
                  <th key={label}>{label}</th>
                ),
              )}
            </tr>
          </thead>
          <tbody>
            {rows.length ? (
              rows.map((row) => (
                <tr key={row[2]}>
                  <td>
                    <strong>{row[0]}</strong>
                  </td>
                  <td>{row[1]}</td>
                  <td className="mono">{row[2]}</td>
                  <td>{row[3]}</td>
                  <td className="mono">{row[4]}</td>
                  <td>
                    {status(
                      row[5],
                      row[5] === "Live"
                        ? "green"
                        : row[5] === "Draft"
                          ? "blue"
                          : "amber",
                    )}
                  </td>
                </tr>
              ))
            ) : (
              <EmptyResults table />
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
}
