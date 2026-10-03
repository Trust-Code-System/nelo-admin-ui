import { EmptyResults } from "../components/EmptyResults";
import { CatalogueVariants } from "../components/CatalogueVariants";
import { filterRecords } from "../lib/records";
import type { AdminState } from "../types";
import {
  I,
  css,
  status,
  btn,
  control,
  pageHead,
} from "../components/presentation";
export function CataloguePage({ state }: { state: AdminState }) {
  return (
    <div className="page">
      {pageHead(
        "Commerce",
        "Catalogue",
        "Manage products, variants and release status.",
        <>{btn("Add product")}</>,
      )}
      <div className="toolbar">
        <label className="search-field">
          {I("search")}
          <input
            type="search"
            aria-label="Search products or SKU"
            placeholder="Search products or SKU"
          />
        </label>
        {control("Linear Summer 26", "collection")}
        {control("All statuses", "productStatus")}
        <div
          className="segmented is-slider"
          style={css(
            "margin-left:auto;--items:2;--active-index:" +
              (state.catalogueMode === "Products" ? 0 : 1),
          )}
        >
          <button
            className={state.catalogueMode === "Products" ? "active" : ""}
          >
            Products
          </button>
          <button
            className={state.catalogueMode === "Variants" ? "active" : ""}
          >
            Variants
          </button>
        </div>
      </div>
      {state.catalogueMode === "Variants" ? (
        <CatalogueVariants />
      ) : (
        <div className="product-grid">
          {filterRecords(
            [
              ["Tokyo mini", "NL-LS26-001", "₦185,000", "black", "Live"],
              ["Midnight Jewel", "NL-LS26-002", "₦295,000", "wine", "Live"],
              ["Santorini set", "NL-LS26-003", "₦240,000", "cream", "Draft"],
              ["Bloom gown · blush", "NL-LS26-004", "₦420,000", "wine", "Live"],
              ["Adele set", "NL-LS26-005", "₦260,000", "black", "Review"],
              ["Reign · violet", "NL-LS26-006", "₦340,000", "cream", "Live"],
            ],
            state,
          ).length ? (
            filterRecords(
              [
                ["Tokyo mini", "NL-LS26-001", "₦185,000", "black", "Live"],
                ["Midnight Jewel", "NL-LS26-002", "₦295,000", "wine", "Live"],
                ["Santorini set", "NL-LS26-003", "₦240,000", "cream", "Draft"],
                [
                  "Bloom gown · blush",
                  "NL-LS26-004",
                  "₦420,000",
                  "wine",
                  "Live",
                ],
                ["Adele set", "NL-LS26-005", "₦260,000", "black", "Review"],
                ["Reign · violet", "NL-LS26-006", "₦340,000", "cream", "Live"],
              ],
              state,
            ).map((r, i) => (
              <button className="product-card" data-detail={r[0]} key={i}>
                <div className={"product-image " + r[3]} />
                <div className="product-copy">
                  <div>
                    <strong>{r[0]}</strong>
                    {status(
                      r[4],
                      r[4] === "Live"
                        ? "green"
                        : r[4] === "Draft"
                          ? "blue"
                          : "amber",
                    )}
                  </div>
                  <p>
                    <span className="mono">{r[1]}</span>
                    {" · "}
                    {r[2]}
                  </p>
                </div>
              </button>
            ))
          ) : (
            <EmptyResults table={false} />
          )}
        </div>
      )}
    </div>
  );
}
