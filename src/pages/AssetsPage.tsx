import { EmptyResults } from "../components/EmptyResults";
import { filterRecords } from "../lib/records";
import type { AdminState } from "../types";
import {
  css,
  status,
  btn,
  control,
  pageHead,
} from "../components/presentation";
export function AssetsPage({ state }: { state: AdminState }) {
  const assetCards = () =>
    filterRecords(
      [
        ["Ivory silk reference", "Fabric · NE-00241", "silk"],
        ["Look 03 construction sketch", "Sketch · NE-00237", "sketch"],
        ["First fitting · front", "Fitting · NE-00232", "black"],
        ["Dewdrop beadwork detail", "Quality control · NE-00229", ""],
        ["Black crepe swatch", "Fabric · NE-00236", "black"],
        ["Bridal train study", "Inspiration · NE-00241", "sketch"],
      ],
      state,
    ).length ? (
      filterRecords(
        [
          ["Ivory silk reference", "Fabric · NE-00241", "silk"],
          ["Look 03 construction sketch", "Sketch · NE-00237", "sketch"],
          ["First fitting · front", "Fitting · NE-00232", "black"],
          ["Dewdrop beadwork detail", "Quality control · NE-00229", ""],
          ["Black crepe swatch", "Fabric · NE-00236", "black"],
          ["Bridal train study", "Inspiration · NE-00241", "sketch"],
        ],
        state,
      ).map((r, index) => (
        <button className="asset-card" data-detail={r[0]} key={index}>
          <div className={"asset-art " + r[2]} />
          <div className="asset-copy">
            <strong>{r[0]}</strong>
            <span>{r[1]}</span>
          </div>
        </button>
      ))
    ) : (
      <EmptyResults table={false} />
    );
  return (
    <div className="page">
      {pageHead(
        "Atelier",
        "Assets",
        "Manage sketches, fabric photos, fitting images and QC files.",
        <>{btn("Upload files", "upload", "primary", 'data-drawer="upload"')}</>,
      )}
      <div className="toolbar">
        {control("All categories", "category")}
        {control("Recently added", "assetSort")}
        <div
          className="segmented is-slider"
          style={css(
            "margin-left:auto;--items:2;--active-index:" +
              (state.assetMode === "grid" ? 0 : 1),
          )}
        >
          <button
            className={state.assetMode === "grid" ? "active" : ""}
            data-asset-mode="grid"
          >
            Grid
          </button>
          <button
            className={state.assetMode === "list" ? "active" : ""}
            data-asset-mode="list"
          >
            List
          </button>
        </div>
      </div>
      {state.assetMode === "grid" ? (
        <div className="asset-grid view-swap">{assetCards()}</div>
      ) : (
        <section className="panel view-swap">
          <div className="table-wrap">
            <table className="data-table">
              <thead>
                <tr>
                  <th>File</th>
                  <th>Category</th>
                  <th>Associated with</th>
                  <th>Uploaded by</th>
                  <th>Date</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {filterRecords(
                  [
                    [
                      "ivory-silk-reference.jpg",
                      "Fabric",
                      "NE-00241",
                      "Ajao",
                      "24 Sep",
                      "Attached",
                    ],
                    [
                      "look-03-sketch.pdf",
                      "Sketch",
                      "NE-00237",
                      "Ghost69",
                      "23 Sep",
                      "Attached",
                    ],
                    [
                      "fitting-front.jpg",
                      "Fitting",
                      "NE-00232",
                      "Bashir",
                      "23 Sep",
                      "Attached",
                    ],
                    [
                      "qc-beadwork.jpg",
                      "Quality control",
                      "NE-00229",
                      "Bashir",
                      "23 Sep",
                      "Processing",
                    ],
                  ],
                  state,
                ).length ? (
                  filterRecords(
                    [
                      [
                        "ivory-silk-reference.jpg",
                        "Fabric",
                        "NE-00241",
                        "Ajao",
                        "24 Sep",
                        "Attached",
                      ],
                      [
                        "look-03-sketch.pdf",
                        "Sketch",
                        "NE-00237",
                        "Ghost69",
                        "23 Sep",
                        "Attached",
                      ],
                      [
                        "fitting-front.jpg",
                        "Fitting",
                        "NE-00232",
                        "Bashir",
                        "23 Sep",
                        "Attached",
                      ],
                      [
                        "qc-beadwork.jpg",
                        "Quality control",
                        "NE-00229",
                        "Bashir",
                        "23 Sep",
                        "Processing",
                      ],
                    ],
                    state,
                  ).map((r, i) => (
                    <tr key={i}>
                      <td>
                        <strong>{r[0]}</strong>
                      </td>
                      <td>{r[1]}</td>
                      <td className="mono">{r[2]}</td>
                      <td>{r[3]}</td>
                      <td className="mono">{r[4]}</td>
                      <td>{status(r[5], i === 3 ? "amber" : "green")}</td>
                    </tr>
                  ))
                ) : (
                  <EmptyResults table={true} />
                )}
              </tbody>
            </table>
          </div>
        </section>
      )}
    </div>
  );
}
