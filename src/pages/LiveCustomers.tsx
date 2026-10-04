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
  type Field,
} from "../components/LiveData";
import {
  documents,
  mutate,
  customerName,
  type Customer,
  type Page,
} from "../lib/operations";
export function LiveCustomers() {
  const { api, channel } = useAdminConnection()!;
  const [skip, setSkip] = useState(0),
    [search, setSearch] = useState(""),
    [selected, setSelected] = useState<Customer | null>(null),
    [create, setCreate] = useState(false);
  const list = useLiveData<{ customers: Page<Customer> }>(
    documents.customers,
    {
      options: {
        skip,
        take: 20,
        sort: { createdAt: "DESC" },
        ...(search ? { filter: { emailAddress: { contains: search } } } : {}),
      },
    },
    can("ReadCustomer")(channel.permissions),
  );
  const fields = (c?: Customer): Field[] => [
    {
      name: "firstName",
      label: "First name",
      value: c?.firstName,
      required: true,
    },
    {
      name: "lastName",
      label: "Last name",
      value: c?.lastName,
      required: true,
    },
    {
      name: "emailAddress",
      label: "Email",
      type: "email",
      value: c?.emailAddress,
      required: true,
    },
    {
      name: "phoneNumber",
      label: "Phone",
      type: "tel",
      value: c?.phoneNumber ?? "",
    },
  ];
  const done = () => {
    setSelected(null);
    setCreate(false);
    list.reload();
  };
  return (
    <>
      <div className="live-toolbar">
        <label className="live-search">
          Search email
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
        {can("CreateCustomer")(channel.permissions) && (
          <button className="btn primary" onClick={() => setCreate(!create)}>
            New customer
          </button>
        )}
      </div>
      <ReadState loading={list.loading} error={list.error} />
      {list.data && (
        <>
          <Table
            rows={list.data.customers.items}
            columns={[
              { label: "Name", render: customerName },
              { label: "Email", render: (c) => c.emailAddress },
              { label: "Phone", render: (c) => c.phoneNumber || "—" },
            ]}
            onSelect={setSelected}
          />
          <Pager
            skip={skip}
            total={list.data.customers.totalItems}
            onPage={setSkip}
          />
        </>
      )}
      {create && (
        <Detail title="New customer" onClose={() => setCreate(false)}>
          <p>
            This creates a customer record. Customers create their own sign-in
            credentials on the storefront.
          </p>
          <ActionForm
            title="Contact details"
            fields={fields()}
            onSave={(v) =>
              mutate(api, channel.token, "createCustomer", { input: v })
            }
            onDone={done}
          />
        </Detail>
      )}
      {selected && (
        <Detail
          title={customerName(selected)}
          onClose={() => setSelected(null)}
        >
          {can("UpdateCustomer")(channel.permissions) ? (
            <ActionForm
              key={selected.id}
              title="Contact details"
              fields={fields(selected)}
              onSave={(v) =>
                mutate(api, channel.token, "updateCustomer", {
                  input: { id: selected.id, ...v },
                })
              }
              onDone={done}
            />
          ) : (
            <p>{selected.emailAddress}</p>
          )}
        </Detail>
      )}
    </>
  );
}
