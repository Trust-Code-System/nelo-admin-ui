import { EmptyResults } from "../components/EmptyResults";
import { filterRecords } from "../lib/records";
import type { AdminState } from "../types";
import { I, status, btn, control, pageHead } from "../components/presentation";
export function CustomersPage({ state }: { state: AdminState }) {
  return (
    <div className="page">
      {pageHead(
        "Commerce",
        "Clients",
        "View client details, order history and upcoming bookings.",
        <>{btn("Add client")}</>,
      )}
      <div className="toolbar">
        <label className="search-field">
          {I("search")}
          <input
            type="search"
            aria-label="Search name, email or phone"
            placeholder="Search name, email or phone"
          />
        </label>
        {control("All segments", "segment")}
        {btn("Filters", "filter", "ghost")}
      </div>
      <section className="panel">
        <div className="table-wrap">
          <table className="data-table">
            <thead>
              <tr>
                <th>Client</th>
                <th>Segment</th>
                <th>Last order</th>
                <th>Lifetime value</th>
                <th>Fit profile</th>
                <th>Next booking</th>
              </tr>
            </thead>
            <tbody>
              {filterRecords(
                [
                  [
                    "AO",
                    "Ada Okafor",
                    "Bridal",
                    "24 Sep",
                    "₦2,840,000",
                    "Verified",
                    "Fitting · Today",
                  ],
                  [
                    "CN",
                    "Chioma Nwosu",
                    "Ready-to-wear",
                    "22 Sep",
                    "₦680,000",
                    "Client submitted",
                    "Consultation · Today",
                  ],
                  [
                    "NE",
                    "Nneka Eze",
                    "Bespoke",
                    "18 Sep",
                    "₦1,420,000",
                    "Verified",
                    "Follow-up · Today",
                  ],
                  [
                    "LA",
                    "Lola Adeyemi",
                    "International",
                    "23 Sep",
                    "$3,280",
                    "Needs review",
                    "Fitting · Today",
                  ],
                  [
                    "TA",
                    "Temi Adeola",
                    "Bridal",
                    "21 Sep",
                    "₦3,100,000",
                    "Verified",
                    "Consultation · Fri",
                  ],
                  [
                    "ZO",
                    "Zainab Olaniyi",
                    "Ready-to-wear",
                    "10 Sep",
                    "₦520,000",
                    "Client submitted",
                    "Not scheduled",
                  ],
                ],
                state,
              ).length ? (
                filterRecords(
                  [
                    [
                      "AO",
                      "Ada Okafor",
                      "Bridal",
                      "24 Sep",
                      "₦2,840,000",
                      "Verified",
                      "Fitting · Today",
                    ],
                    [
                      "CN",
                      "Chioma Nwosu",
                      "Ready-to-wear",
                      "22 Sep",
                      "₦680,000",
                      "Client submitted",
                      "Consultation · Today",
                    ],
                    [
                      "NE",
                      "Nneka Eze",
                      "Bespoke",
                      "18 Sep",
                      "₦1,420,000",
                      "Verified",
                      "Follow-up · Today",
                    ],
                    [
                      "LA",
                      "Lola Adeyemi",
                      "International",
                      "23 Sep",
                      "$3,280",
                      "Needs review",
                      "Fitting · Today",
                    ],
                    [
                      "TA",
                      "Temi Adeola",
                      "Bridal",
                      "21 Sep",
                      "₦3,100,000",
                      "Verified",
                      "Consultation · Fri",
                    ],
                    [
                      "ZO",
                      "Zainab Olaniyi",
                      "Ready-to-wear",
                      "10 Sep",
                      "₦520,000",
                      "Client submitted",
                      "Not scheduled",
                    ],
                  ],
                  state,
                ).map((r, i) => (
                  <tr key={i}>
                    <td>
                      <div className="cell-title">
                        <span className="mini-avatar">{r[0]}</span>
                        <div>
                          <strong>{r[1]}</strong>
                          <span>
                            {r[0].toLowerCase()}
                            @example.com
                          </span>
                        </div>
                      </div>
                    </td>
                    <td>{r[2]}</td>
                    <td className="mono">{r[3]}</td>
                    <td className="mono">{r[4]}</td>
                    <td>
                      {status(
                        r[5],
                        i === 3 ? "red" : i === 1 || i === 5 ? "blue" : "green",
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
