import { useState } from "react";
import { useAdminConnection } from "../components/AdminConnection";
import {
  ActionForm,
  Detail,
  Pager,
  ReadState,
  useLiveData,
  can,
} from "../components/LiveData";
import {
  documents,
  mutate,
  customerName,
  type Project,
  type Customer,
  type MeasurementProfile,
  type Page,
} from "../lib/operations";
const projectTransitions: Record<string, string[]> = {
  consultation: ["proposal", "cancelled"],
  proposal: ["consultation", "confirmed", "cancelled"],
  confirmed: ["proposal", "active", "cancelled"],
  active: ["ready", "cancelled"],
  ready: ["active", "completed", "cancelled"],
  completed: [],
  cancelled: [],
};
const itemTransitions: Record<string, string[]> = {
  design: ["awaitingMaterials", "cutting", "cancelled"],
  awaitingMaterials: ["cutting", "cancelled"],
  cutting: ["sewing", "cancelled"],
  sewing: ["fitting", "qualityControl", "cancelled"],
  fitting: ["sewing", "qualityControl", "cancelled"],
  qualityControl: ["sewing", "ready", "cancelled"],
  ready: ["fitting", "delivered", "cancelled"],
  delivered: [],
  cancelled: [],
};
export function LiveCommissions({
  production = false,
}: {
  production?: boolean;
}) {
  const { api, channel } = useAdminConnection()!;
  const [skip, setSkip] = useState(0),
    [selected, setSelected] = useState<Project | null>(null),
    [create, setCreate] = useState(false);
  const [customerSearch, setCustomerSearch] = useState("");
  const customers = useLiveData<{ customers: Page<Customer> }>(
    documents.customers,
    {
      options: {
        take: 100,
        ...(customerSearch
          ? { filter: { emailAddress: { contains: customerSearch } } }
          : {}),
      },
    },
    create && can("ReadCustomer")(channel.permissions),
  );
  const profiles = useLiveData<{
    atelierMeasurementProfiles: MeasurementProfile[];
  }>(
    documents.profiles,
    { customerId: selected?.customer?.id },
    !!selected?.customer &&
      can("ManageAtelierMeasurements")(channel.permissions),
  );
  const appointments = useLiveData<{
    atelierAppointments: Page<{
      id: string;
      purpose: string;
      startsAt: string;
      status: string;
    }>;
  }>(
    documents.appointments,
    { options: { customerId: selected?.customer?.id, take: 50 } },
    !!selected?.customer &&
      can("ManageAtelierAppointments")(channel.permissions),
  );
  const orders = useLiveData<{
    customer: {
      orders: {
        items: {
          code: string;
          lines: { id: string; productVariant: { name: string } }[];
        }[];
      };
    } | null;
  }>(
    documents.customerOrders,
    { customerId: selected?.customer?.id },
    !!selected?.customer &&
      can("ReadCustomer")(channel.permissions) &&
      can("ReadOrder")(channel.permissions),
  );
  const allowed = can("ManageAtelierCommissions")(channel.permissions);
  const list = useLiveData<{ bespokeProjects: Page<Project> }>(
    documents.commissions,
    { options: { skip, take: 20 } },
    allowed,
  );
  const done = () => {
    setSelected(null);
    setCreate(false);
    list.reload();
  };
  const run = (
    name: Parameters<typeof mutate>[2],
    input: Record<string, unknown>,
  ) => mutate(api, channel.token, name, { input });
  if (!allowed)
    return (
      <p className="live-notice">
        Commission management permission is required.
      </p>
    );
  return (
    <>
      <div className="live-toolbar">
        <button className="btn" onClick={done}>
          Refresh
        </button>
        {!production && (
          <button className="btn primary" onClick={() => setCreate(!create)}>
            New commission
          </button>
        )}
      </div>
      <ReadState loading={list.loading} error={list.error} />
      {list.data && (
        <>
          <section className="board-summary">
            <div className="board-summary-copy">
              <strong>
                {production ? "Production workboard" : "Atelier workboard"}
              </strong>
              <span>
                {list.data.bespokeProjects.totalItems} commissions ·{" "}
                {list.data.bespokeProjects.items.length} on this page
              </span>
            </div>
            <div className="board-stat">
              <strong>
                {
                  list.data.bespokeProjects.items.filter(
                    (p) => !["completed", "cancelled"].includes(p.stage),
                  ).length
                }
              </strong>
              <span>Open on this page</span>
            </div>
          </section>
          <div className="kanban live-workboard">
            {(production
              ? [
                  {
                    label: "Preparation",
                    stages: ["design", "awaitingMaterials"],
                  },
                  { label: "Making", stages: ["cutting", "sewing"] },
                  {
                    label: "Fitting & finishing",
                    stages: ["fitting", "qualityControl", "ready"],
                  },
                  { label: "Closed", stages: ["delivered", "cancelled"] },
                ]
              : [
                  {
                    label: "Consultation & proposal",
                    stages: ["consultation", "proposal"],
                  },
                  {
                    label: "Confirmed & active",
                    stages: ["confirmed", "active"],
                  },
                  { label: "Ready", stages: ["ready"] },
                  { label: "Closed", stages: ["completed", "cancelled"] },
                ]
            ).map((column) => {
              const cards = list.data!.bespokeProjects.items.flatMap((p) =>
                production
                  ? p.items
                      .filter((i) => column.stages.includes(i.stage))
                      .map((i) => ({
                        project: p,
                        id: i.id,
                        name: i.name,
                        stage: i.stage,
                        date: i.targetCompletionDate,
                      }))
                  : column.stages.includes(p.stage)
                    ? [
                        {
                          project: p,
                          id: p.id,
                          name:
                            p.items.map((i) => i.name).join(" · ") ||
                            p.reference,
                          stage: p.stage,
                          date: p.targetCompletionDate,
                        },
                      ]
                    : [],
              );
              return (
                <section className="kanban-col" key={column.label}>
                  <div className="kanban-head">
                    <div>
                      <i />
                      <strong>{column.label}</strong>
                    </div>
                    <span>{cards.length.toString().padStart(2, "0")}</span>
                  </div>
                  {cards.map((card) => (
                    <button
                      className="job-card"
                      key={card.id}
                      onClick={() => setSelected(card.project)}
                    >
                      <div className="job-ref">
                        <span>{card.project.reference}</span>
                        <span>{card.project.context}</span>
                      </div>
                      <h3>{card.name}</h3>
                      <p>{customerName(card.project.customer)}</p>
                      <div className="job-next">
                        <span>{card.stage}</span>
                        <span aria-hidden="true">→</span>
                      </div>
                      <div className="job-meta">
                        <span className="mono">
                          {card.date || "No target date"}
                        </span>
                      </div>
                    </button>
                  ))}
                  {!cards.length && (
                    <p className="live-empty">
                      No work at this stage on this page.
                    </p>
                  )}
                </section>
              );
            })}
          </div>
          <Pager
            skip={skip}
            total={list.data.bespokeProjects.totalItems}
            onPage={setSkip}
          />
        </>
      )}
      {create && (
        <Detail title="New commission" onClose={() => setCreate(false)}>
          <label className="live-search">
            Find customer by email
            <input
              value={customerSearch}
              onChange={(e) => setCustomerSearch(e.target.value)}
            />
          </label>
          <ReadState loading={customers.loading} error={customers.error} />
          <p className="live-hint">
            Select an existing customer. Search by email to narrow the first 100
            matches.
          </p>
          <ActionForm
            title="Commission details"
            fields={[
              {
                name: "customerId",
                label: "Customer",
                required: true,
                options: (customers.data?.customers.items ?? []).map((c) => ({
                  value: c.id,
                  label: `${customerName(c)} · ${c.emailAddress}`,
                })),
              },
              {
                name: "context",
                label: "Context",
                value: "bespoke",
                options: [
                  { value: "bespoke", label: "Bespoke" },
                  { value: "bridal", label: "Bridal" },
                ],
              },
              { name: "itemName", label: "First item name", required: true },
              {
                name: "targetCompletionDate",
                label: "Target completion date",
                type: "date",
              },
              { name: "notes", label: "Notes", type: "textarea" },
            ]}
            onSave={(v) =>
              run("createBespokeProject", {
                customerId: v.customerId,
                context: v.context,
                items: [{ name: v.itemName }],
                ...(v.targetCompletionDate
                  ? { targetCompletionDate: v.targetCompletionDate }
                  : {}),
                notes: v.notes,
              })
            }
            onDone={done}
          />
        </Detail>
      )}
      {selected && (
        <Detail title={selected.reference} onClose={() => setSelected(null)}>
          <p>
            {customerName(selected.customer)} · {selected.context} ·{" "}
            {selected.stage}
          </p>
          <p>{selected.customer?.emailAddress}</p>
          <p>Customer ID: {selected.customer?.id || "Unavailable"}</p>
          <ActionForm
            key={`${selected.id}-${selected.version}`}
            title="Commission notes and deadline"
            fields={[
              {
                name: "notes",
                label: "Notes",
                type: "textarea",
                value: selected.notes ?? "",
              },
              {
                name: "targetCompletionDate",
                label: "Target completion date",
                type: "date",
                value: selected.targetCompletionDate ?? "",
              },
            ]}
            onSave={(v) =>
              run("updateBespokeProject", {
                id: selected.id,
                version: selected.version,
                notes: v.notes || null,
                targetCompletionDate: v.targetCompletionDate || null,
              })
            }
            onDone={done}
          />
          {projectTransitions[selected.stage]?.length > 0 && (
            <ActionForm
              title="Change commission stage"
              fields={[
                {
                  name: "stage",
                  label: "Next stage",
                  required: true,
                  options: projectTransitions[selected.stage].map((s) => ({
                    value: s,
                    label: s,
                  })),
                },
              ]}
              onSave={(v) =>
                run("transitionBespokeProject", {
                  id: selected.id,
                  version: selected.version,
                  stage: v.stage,
                })
              }
              onDone={done}
            />
          )}
          <p className="live-hint">
            The backend checks the stage, version and measurement snapshot
            before approving a transition.
          </p>
          <h3>Items</h3>
          {selected.items.map((i) => (
            <article className="live-variant" key={i.id}>
              <h4>
                {i.name} · {i.stage}
              </h4>
              <p>
                Item ID: {i.id} · Linked orders:{" "}
                {i.linkedOrderLines.map((l) => l.orderCode).join(", ") ||
                  "None"}
              </p>
              <ActionForm
                title="Edit item"
                fields={[
                  {
                    name: "name",
                    label: "Name",
                    required: true,
                    value: i.name,
                  },
                  {
                    name: "targetCompletionDate",
                    label: "Target completion date",
                    type: "date",
                    value: i.targetCompletionDate ?? "",
                  },
                ]}
                onSave={(v) =>
                  run("updateBespokeItem", {
                    id: i.id,
                    version: i.version,
                    name: v.name,
                    targetCompletionDate: v.targetCompletionDate || null,
                  })
                }
                onDone={done}
              />
              {itemTransitions[i.stage]?.length > 0 && (
                <ActionForm
                  title="Production stage"
                  fields={[
                    {
                      name: "stage",
                      label: "Next stage",
                      required: true,
                      options: itemTransitions[i.stage].map((s) => ({
                        value: s,
                        label: s,
                      })),
                    },
                  ]}
                  onSave={(v) =>
                    run("transitionBespokeItem", {
                      id: i.id,
                      version: i.version,
                      stage: v.stage,
                    })
                  }
                  onDone={done}
                />
              )}
              <ActionForm
                title="Link an order line"
                fields={[
                  {
                    name: "orderLineId",
                    label: "Customer order line",
                    required: true,
                    options: (
                      orders.data?.customer?.orders.items ?? []
                    ).flatMap((o) =>
                      o.lines.map((l) => ({
                        value: l.id,
                        label: `${o.code} · ${l.productVariant.name}`,
                      })),
                    ),
                    hint:
                      orders.error ||
                      "Lines from this customer’s first 100 orders. If none are listed, check their orders and your permissions.",
                  },
                ]}
                onSave={(v) =>
                  run("linkBespokeItemOrderLine", {
                    itemId: i.id,
                    itemVersion: i.version,
                    orderLineId: v.orderLineId,
                  })
                }
                onDone={done}
              />
            </article>
          ))}
          <ActionForm
            title="Add item"
            fields={[
              { name: "name", label: "Name", required: true },
              {
                name: "targetCompletionDate",
                label: "Target completion date",
                type: "date",
              },
            ]}
            onSave={(v) =>
              run("addBespokeItem", {
                projectId: selected.id,
                projectVersion: selected.version,
                name: v.name,
                ...(v.targetCompletionDate
                  ? { targetCompletionDate: v.targetCompletionDate }
                  : {}),
              })
            }
            onDone={done}
          />
          <h3>Appointments</h3>
          {selected.appointments.map((a) => (
            <p key={a.id}>
              {a.purpose} · {a.status} · {new Date(a.startsAt).toLocaleString()}
            </p>
          ))}
          <ActionForm
            title="Associate appointment"
            fields={[
              {
                name: "appointmentId",
                label: "Customer appointment",
                required: true,
                options: (
                  appointments.data?.atelierAppointments.items ?? []
                ).map((a) => ({
                  value: a.id,
                  label: `${a.purpose} · ${new Date(a.startsAt).toLocaleString()} · ${a.status}`,
                })),
                hint:
                  appointments.error ||
                  "This customer’s first 50 appointments.",
              },
            ]}
            onSave={(v) =>
              run("associateAtelierAppointment", {
                projectId: selected.id,
                projectVersion: selected.version,
                appointmentId: v.appointmentId,
              })
            }
            onDone={done}
          />
          <h3>Confirmed measurements</h3>
          {selected.measurements ? (
            <dl className="live-facts">
              {selected.measurements.measurements.map((m) => (
                <div key={m.code}>
                  <dt>{m.code}</dt>
                  <dd>{m.millimetres} mm</dd>
                </div>
              ))}
            </dl>
          ) : (
            <p>No measurement snapshot confirmed.</p>
          )}
          <ActionForm
            title="Confirm measurement snapshot"
            fields={[
              {
                name: "profileId",
                label: "Customer measurement profile",
                required: true,
                options: (profiles.data?.atelierMeasurementProfiles ?? []).map(
                  (p) => ({
                    value: p.id,
                    label: `${p.name}${p.isDefault ? " (default)" : ""}`,
                  }),
                ),
                hint: profiles.error || "Profiles belonging to this customer.",
              },
            ]}
            onSave={(v) =>
              run("confirmBespokeProjectMeasurements", {
                id: selected.id,
                version: selected.version,
                profileId: v.profileId,
              })
            }
            onDone={done}
          />
        </Detail>
      )}
    </>
  );
}
