import { EmptyResults } from "../components/EmptyResults";
import { filterRecords } from "../lib/records";
import type { AdminState } from "../types";
import { I, status, btn, control, pageHead } from "../components/presentation";
export function OrdersPage({ state }: { state: AdminState }) {
  return (
    <div className="page">
      {pageHead(
        "Commerce",
        "Orders",
        "View payment, fulfilment and delivery status.",
        <>{btn("Create order")}</>,
      )}
      <div className="toolbar">
        <label className="search-field">
          {I("search")}
          <input
            type="search"
            aria-label="Search order or client"
            placeholder="Search order or client"
          />
        </label>
        {control("All statuses", "orderStatus")}
        {control("Last 30 days", "range")}
        {btn("Export", "upload", "ghost")}
      </div>
      <section className="panel">
        <div className="table-wrap">
          <table className="data-table">
            <thead>
              <tr>
                <th>Order</th>
                <th>Client</th>
                <th>Placed</th>
                <th>Market</th>
                <th>Total</th>
                <th>Payment</th>
                <th>Fulfilment</th>
              </tr>
            </thead>
            <tbody>
              {filterRecords(
                [
                  [
                    "#1048",
                    "Ada Okafor",
                    "24 Sep · 09:42",
                    "NG",
                    "₦840,000",
                    "Paid",
                    "Atelier",
                  ],
                  [
                    "#1047",
                    "Muna Bello",
                    "23 Sep · 17:18",
                    "NG",
                    "₦295,000",
                    "Paid",
                    "Packing",
                  ],
                  [
                    "#1046",
                    "Lola Adeyemi",
                    "23 Sep · 14:06",
                    "UK",
                    "$1,240",
                    "Authorised",
                    "Production",
                  ],
                  [
                    "#1045",
                    "Chioma Nwosu",
                    "22 Sep · 18:32",
                    "NG",
                    "₦460,000",
                    "Pending",
                    "On hold",
                  ],
                  [
                    "#1044",
                    "Nneka Eze",
                    "22 Sep · 10:14",
                    "UK",
                    "$780",
                    "Refunded",
                    "Returned",
                  ],
                  [
                    "#1043",
                    "Temi Adeola",
                    "21 Sep · 12:20",
                    "NG",
                    "₦1,250,000",
                    "Paid",
                    "Atelier",
                  ],
                ],
                state,
              ).length ? (
                filterRecords(
                  [
                    [
                      "#1048",
                      "Ada Okafor",
                      "24 Sep · 09:42",
                      "NG",
                      "₦840,000",
                      "Paid",
                      "Atelier",
                    ],
                    [
                      "#1047",
                      "Muna Bello",
                      "23 Sep · 17:18",
                      "NG",
                      "₦295,000",
                      "Paid",
                      "Packing",
                    ],
                    [
                      "#1046",
                      "Lola Adeyemi",
                      "23 Sep · 14:06",
                      "UK",
                      "$1,240",
                      "Authorised",
                      "Production",
                    ],
                    [
                      "#1045",
                      "Chioma Nwosu",
                      "22 Sep · 18:32",
                      "NG",
                      "₦460,000",
                      "Pending",
                      "On hold",
                    ],
                    [
                      "#1044",
                      "Nneka Eze",
                      "22 Sep · 10:14",
                      "UK",
                      "$780",
                      "Refunded",
                      "Returned",
                    ],
                    [
                      "#1043",
                      "Temi Adeola",
                      "21 Sep · 12:20",
                      "NG",
                      "₦1,250,000",
                      "Paid",
                      "Atelier",
                    ],
                  ],
                  state,
                ).map((r, i) => (
                  <tr key={i}>
                    <td className="mono">
                      <strong>{r[0]}</strong>
                    </td>
                    <td>{r[1]}</td>
                    <td className="mono">{r[2]}</td>
                    <td>{r[3]}</td>
                    <td className="mono">{r[4]}</td>
                    <td>
                      {status(
                        r[5],
                        i === 3 ? "amber" : i === 4 ? "red" : "green",
                      )}
                    </td>
                    <td>{r[6]}</td>
                  </tr>
                ))
              ) : (
                <EmptyResults table={true} />
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
