import { useState } from "react";
import { useAdminConnection } from "../components/AdminConnection";
import {
  ActionForm,
  Detail,
  Pager,
  ReadState,
  Table,
  useLiveData,
  can,
} from "../components/LiveData";
import {
  documents,
  mutate,
  money,
  customerName,
  type Order,
  type Page,
} from "../lib/operations";
interface Handler {
  code: string;
  args: {
    name: string;
    type: string;
    required: boolean;
    defaultValue: string | null;
  }[];
}
export function LiveOrders() {
  const { api, channel } = useAdminConnection()!;
  const [skip, setSkip] = useState(0),
    [search, setSearch] = useState(""),
    [selected, setSelected] = useState<Order | null>(null),
    [handler, setHandler] = useState("");
  const list = useLiveData<{ orders: Page<Order> }>(
    documents.orders,
    {
      options: {
        skip,
        take: 20,
        sort: { createdAt: "DESC" },
        ...(search ? { filter: { code: { contains: search } } } : {}),
      },
    },
    can("ReadOrder")(channel.permissions),
  );
  const handlers = useLiveData<{ fulfillmentHandlers: Handler[] }>(
    documents.fulfillmentHandlers,
    {},
    can("UpdateOrder")(channel.permissions),
  );
  const currentHandler = handlers.data?.fulfillmentHandlers.find(
    (h) => h.code === handler,
  );
  const done = () => {
    setSelected(null);
    list.reload();
  };
  return (
    <>
      <div className="live-toolbar">
        <label className="live-search">
          Search order code
          <input
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setSkip(0);
            }}
          />
        </label>
        <button className="btn" onClick={done}>
          Refresh
        </button>
      </div>
      <ReadState loading={list.loading} error={list.error} />
      {list.data && (
        <>
          <Table
            rows={list.data.orders.items}
            columns={[
              { label: "Order", render: (o) => o.code },
              { label: "Customer", render: (o) => customerName(o.customer) },
              { label: "Status", render: (o) => o.state },
              {
                label: "Total",
                render: (o) => money(o.totalWithTax, o.currencyCode),
              },
              {
                label: "Created",
                render: (o) => new Date(o.createdAt).toLocaleDateString(),
              },
            ]}
            onSelect={setSelected}
          />
          <Pager
            skip={skip}
            total={list.data.orders.totalItems}
            onPage={setSkip}
          />
        </>
      )}
      {selected && (
        <Detail title={selected.code} onClose={() => setSelected(null)}>
          <p>
            {selected.state} ·{" "}
            {money(selected.totalWithTax, selected.currencyCode)}
          </p>
          <p>
            {customerName(selected.customer)} ·{" "}
            {selected.customer?.emailAddress}
          </p>
          <p>
            {[
              selected.shippingAddress?.fullName,
              selected.shippingAddress?.streetLine1,
              selected.shippingAddress?.city,
              selected.shippingAddress?.country,
            ]
              .filter(Boolean)
              .join(", ")}
          </p>
          <h3>Order lines</h3>
          <Table
            rows={selected.lines}
            columns={[
              { label: "Item", render: (l) => l.productVariant.name },
              { label: "SKU", render: (l) => l.productVariant.sku },
              { label: "Quantity", render: (l) => l.quantity },
              {
                label: "Amount",
                render: (l) =>
                  money(l.discountedLinePriceWithTax, selected.currencyCode),
              },
              { label: "Line ID", render: (l) => l.id },
            ]}
          />
          <h3>Payments</h3>
          {selected.payments?.map((p) => (
            <article key={p.id} className="live-variant">
              <strong>
                {p.method} · {p.state} ·{" "}
                {money(p.amount, selected.currencyCode)}
              </strong>
              {p.refunds.map((f) => (
                <p key={f.id}>
                  Refund: {f.state} · {money(f.total, selected.currencyCode)} ·{" "}
                  {f.reason}
                </p>
              ))}
            </article>
          ))}
          {!selected.payments?.length && <p>No payment records.</p>}
          <h3>Fulfilment</h3>
          {selected.fulfillments?.map((f) => (
            <article key={f.id} className="live-variant">
              <p>
                {f.method} · {f.state} · {f.trackingCode || "No tracking code"}
              </p>
              {can("UpdateOrder")(channel.permissions) &&
                f.nextStates.filter((s) => s === "Shipped" || s === "Delivered")
                  .length > 0 && (
                  <ActionForm
                    title="Update fulfilment status"
                    fields={[
                      {
                        name: "state",
                        label: "Next status",
                        required: true,
                        options: f.nextStates
                          .filter((s) => s === "Shipped" || s === "Delivered")
                          .map((s) => ({ value: s, label: s })),
                      },
                    ]}
                    onSave={(v) =>
                      mutate(
                        api,
                        channel.token,
                        "transitionFulfillmentToState",
                        { id: f.id, state: v.state },
                      )
                    }
                    onDone={done}
                  />
                )}
            </article>
          ))}
          {can("UpdateOrder")(channel.permissions) &&
            [
              "PaymentAuthorized",
              "PaymentSettled",
              "PartiallyShipped",
            ].includes(selected.state) && (
              <>
                <ReadState loading={handlers.loading} error={handlers.error} />
                <label className="live-handler">
                  Fulfilment handler
                  <select
                    value={handler}
                    onChange={(e) => setHandler(e.target.value)}
                  >
                    <option value="">Choose a handler</option>
                    {handlers.data?.fulfillmentHandlers.map((h) => (
                      <option key={h.code} value={h.code}>
                        {h.code}
                      </option>
                    ))}
                  </select>
                </label>
                {currentHandler && (
                  <ActionForm
                    key={handler}
                    title="Create fulfilment"
                    submit="Fulfil selected quantities"
                    fields={[
                      ...selected.lines.map((l) => ({
                        name: `line-${l.id}`,
                        label: `Quantity · ${l.productVariant.name}`,
                        type: "number",
                        value: "0",
                      })),
                      ...currentHandler.args.map((a) => ({
                        name: `arg-${a.name}`,
                        label: a.name,
                        required: a.required,
                        value: a.defaultValue ?? "",
                      })),
                    ]}
                    onSave={(v) => {
                      const lines = selected.lines
                        .map((l) => {
                          const raw = v[`line-${l.id}`];
                          if (!/^\d+$/.test(raw))
                            throw new Error(
                              "Fulfilment quantities must be whole numbers.",
                            );
                          const quantity = Number(raw);
                          const fulfilled =
                            selected.fulfillments
                              ?.filter((f) => f.state !== "Cancelled")
                              .reduce(
                                (sum, f) =>
                                  sum +
                                  f.lines
                                    .filter((fl) => fl.orderLineId === l.id)
                                    .reduce((n, fl) => n + fl.quantity, 0),
                                0,
                              ) ?? 0;
                          if (quantity > l.quantity - fulfilled)
                            throw new Error(
                              "Quantity exceeds the unfulfilled items.",
                            );
                          return { orderLineId: l.id, quantity };
                        })
                        .filter((l) => l.quantity > 0);
                      if (!lines.length)
                        throw new Error("Choose at least one item to fulfil.");
                      return mutate(
                        api,
                        channel.token,
                        "addFulfillmentToOrder",
                        {
                          input: {
                            lines,
                            handler: {
                              code: handler,
                              arguments: currentHandler.args.map((a) => ({
                                name: a.name,
                                value: v[`arg-${a.name}`],
                              })),
                            },
                          },
                        },
                      );
                    }}
                    onDone={done}
                  />
                )}
              </>
            )}
          <p className="live-hint">
            Payments reflect the backend's provider records. Refunds, payment
            reconciliation and order cancellation remain in the Vendure
            dashboard; this screen never manually marks an order as paid.
          </p>
        </Detail>
      )}
    </>
  );
}
