import { useState } from "react";
import { useAdminConnection } from "../components/AdminConnection";
import {
  ActionForm,
  Pager,
  ReadState,
  useLiveData,
  can,
} from "../components/LiveData";
import {
  documents,
  mutate,
  customerName,
  type Customer,
  type Page,
  type MeasurementProfile,
} from "../lib/operations";
export const measurementCodes = [
  "bust",
  "waist",
  "hip",
  "height",
  "shoulderWidth",
  "sleeveLength",
  "inseam",
];
export function LiveMeasurements() {
  const { api, channel } = useAdminConnection()!;
  const [customerId, setCustomerId] = useState(""),
    [skip, setSkip] = useState(0),
    [search, setSearch] = useState("");
  const customers = useLiveData<{ customers: Page<Customer> }>(
    documents.customers,
    {
      options: {
        skip,
        take: 20,
        ...(search ? { filter: { emailAddress: { contains: search } } } : {}),
      },
    },
    can("ReadCustomer")(channel.permissions),
  );
  const profiles = useLiveData<{
    atelierMeasurementProfiles: MeasurementProfile[];
  }>(
    documents.profiles,
    { customerId },
    !!customerId && can("ManageAtelierMeasurements")(channel.permissions),
  );
  return (
    <>
      <div className="live-toolbar">
        <label className="live-search">
          Find customer by email
          <input
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setSkip(0);
            }}
          />
        </label>
        <label>
          Customer
          <select
            value={customerId}
            onChange={(e) => setCustomerId(e.target.value)}
          >
            <option value="">Select a customer</option>
            {customers.data?.customers.items.map((c) => (
              <option key={c.id} value={c.id}>
                {customerName(c)} · {c.emailAddress}
              </option>
            ))}
          </select>
        </label>
        <button className="btn" onClick={profiles.reload}>
          Refresh measurements
        </button>
      </div>
      <ReadState loading={customers.loading} error={customers.error} />
      {customers.data && (
        <Pager
          skip={skip}
          total={customers.data.customers.totalItems}
          onPage={setSkip}
        />
      )}
      {!can("ManageAtelierMeasurements")(channel.permissions) ? (
        <p className="live-notice">
          Measurement management permission is required.
        </p>
      ) : customerId ? (
        <>
          <ReadState loading={profiles.loading} error={profiles.error} />
          {profiles.data?.atelierMeasurementProfiles.map((p) => (
            <article className="panel live-detail" key={p.id}>
              <h2>
                {p.name}
                {p.isDefault ? " · Default" : ""}
              </h2>
              <p>
                Source: {p.source} · Display unit: {p.preferredDisplayUnit}
              </p>
              <dl className="live-facts">
                {p.measurements.map((m) => (
                  <div key={m.code}>
                    <dt>{m.code}</dt>
                    <dd>{m.millimetres} mm</dd>
                  </div>
                ))}
              </dl>
              <p className="live-hint">Profile ID: {p.id}</p>
            </article>
          ))}
          {profiles.data &&
            !profiles.data.atelierMeasurementProfiles.length && (
              <p className="live-empty">
                This customer has no measurement profiles.
              </p>
            )}
          <ActionForm
            key={customerId}
            title="Record a measurement profile"
            fields={[
              { name: "name", label: "Profile name", required: true },
              {
                name: "unit",
                label: "Input unit",
                value: "inch",
                options: [
                  { value: "inch", label: "Inches" },
                  { value: "centimetre", label: "Centimetres" },
                ],
              },
              {
                name: "makeDefault",
                label: "Default profile",
                value: "false",
                options: [
                  { value: "false", label: "Keep current default" },
                  { value: "true", label: "Make this the default" },
                ],
              },
              ...measurementCodes.map((code) => ({
                name: code,
                label: code,
                required: true,
              })),
            ]}
            onSave={(v) =>
              mutate(api, channel.token, "recordAtelierMeasurementProfile", {
                input: {
                  customerId,
                  name: v.name,
                  preferredDisplayUnit: v.unit,
                  makeDefault: v.makeDefault === "true",
                  values: measurementCodes.map((code) => ({
                    code,
                    value: v[code],
                  })),
                },
              })
            }
            onDone={profiles.reload}
            submit="Record profile"
          />
          <p className="live-hint">
            Vendure validates and converts measurements to decimal millimetres.
            Validation overrides and privacy/retention administration remain
            advanced operations.
          </p>
        </>
      ) : (
        <p className="live-empty">
          Select a customer to load their real measurement profiles.
        </p>
      )}
    </>
  );
}
