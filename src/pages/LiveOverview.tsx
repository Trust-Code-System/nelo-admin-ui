import { kpiCard } from "../components/kpiCard";
import { customerName } from "../lib/operations";
import { useAdminConnection } from "../components/AdminConnection";
import {
  documents,
  type Page,
  type Profile,
  type Project,
  mutate,
} from "../lib/operations";
import {
  ActionForm,
  ReadState,
  useLiveData,
  can,
} from "../components/LiveData";
export function LiveOverview() {
  const { channel, user } = useAdminConnection()!;
  const products = useLiveData<{ products: Page<{ id: string }> }>(
    documents.products,
    { options: { take: 1 } },
    can("ReadCatalog")(channel.permissions),
  );
  const orders = useLiveData<{ orders: Page<{ id: string }> }>(
    documents.orders,
    { options: { take: 1 } },
    can("ReadOrder")(channel.permissions),
  );
  const customers = useLiveData<{ customers: Page<{ id: string }> }>(
    documents.customers,
    { options: { take: 1 } },
    can("ReadCustomer")(channel.permissions),
  );
  const projects = useLiveData<{ bespokeProjects: Page<Project> }>(
    documents.commissions,
    { options: { take: 20 } },
    can("ManageAtelierCommissions")(channel.permissions),
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
    { options: { take: 20 } },
    can("ManageAtelierAppointments")(channel.permissions),
  );
  const recentProjects = projects.data?.bespokeProjects.items ?? [];
  const upcoming = (appointments.data?.atelierAppointments.items ?? [])
    .filter((a) => new Date(a.startsAt).getTime() >= Date.now())
    .sort((a, b) => a.startsAt.localeCompare(b.startsAt))
    .slice(0, 5);
  const refresh = () => {
    products.reload();
    orders.reload();
    customers.reload();
    projects.reload();
    appointments.reload();
  };
  return (
    <div className="overview-page">
      <section className="welcome-bar">
        <div className="welcome-copy">
          <div className="welcome-meta">
            {new Intl.DateTimeFormat(undefined, {
              weekday: "long",
              day: "numeric",
              month: "long",
            }).format(new Date())}{" "}
            · {channel.code}
          </div>
          <h1>Welcome back, {user.identifier}.</h1>
          <p>Your Atelier and store, at a glance.</p>
        </div>
        <div className="welcome-actions">
          <button className="ghost" onClick={refresh}>
            Refresh data
          </button>
          <a className="primary" href="#appointments">
            View appointments
          </a>
        </div>
      </section>
      <div className="dashboard-heading">
        <div>
          <h2>Highlights</h2>
          <p>Current records in {channel.code}.</p>
        </div>
      </div>
      <section
        className="dashboard-kpis"
        onClick={(event) => {
          const view = (event.target as HTMLElement).closest<HTMLButtonElement>(
            "[data-view]",
          )?.dataset.view;
          if (view) location.hash = view;
        }}
      >
        {[
          {
            label: "Products",
            icon: "box",
            view: "catalogue",
            read: products,
            count: products.data?.products.totalItems,
          },
          {
            label: "Orders",
            icon: "bag",
            view: "orders",
            read: orders,
            count: orders.data?.orders.totalItems,
          },
          {
            label: "Customers",
            icon: "users",
            view: "customers",
            read: customers,
            count: customers.data?.customers.totalItems,
          },
          {
            label: "Commissions",
            icon: "layers",
            view: "commissions",
            read: projects,
            count: projects.data?.bespokeProjects.totalItems,
          },
        ].map((m) => (
          <div key={m.label}>
            {kpiCard(
              m.icon,
              m.label,
              m.read.loading ? "…" : String(m.count ?? "—"),
              "",
              null,
              m.view,
            )}
            {m.read.error && (
              <p className="live-error" role="alert">
                {m.read.error}
              </p>
            )}
          </div>
        ))}
      </section>
      <div className="dashboard-lower">
        <section className="overview-panel">
          <div className="overview-panel-head">
            <div>
              <h2>Recent commissions</h2>
              <p>Work and deadlines from the current commission page.</p>
            </div>
            <a className="link-btn" href="#commissions">
              View workboard
            </a>
          </div>
          <div className="overview-panel-body">
            <ReadState loading={projects.loading} error={projects.error} />
            {recentProjects.slice(0, 6).map((p) => (
              <a className="live-overview-row" href="#commissions" key={p.id}>
                <div>
                  <span className="mono">{p.reference}</span>
                  <strong>{customerName(p.customer)}</strong>
                  <small>{p.items.map((i) => i.name).join(" · ")}</small>
                </div>
                <div>
                  <span className="status">{p.stage}</span>
                  <small>{p.targetCompletionDate || "No target date"}</small>
                </div>
              </a>
            ))}
            {projects.data && !recentProjects.length && (
              <p className="live-empty">No commissions in this channel yet.</p>
            )}
          </div>
        </section>
        <section className="overview-panel">
          <div className="overview-panel-head">
            <div>
              <h2>Appointment schedule</h2>
              <p>Upcoming appointments from the current schedule page.</p>
            </div>
            <a className="link-btn" href="#calendar">
              View schedule
            </a>
          </div>
          <div className="overview-panel-body">
            <ReadState
              loading={appointments.loading}
              error={appointments.error}
            />
            {upcoming.map((a) => (
              <a className="live-overview-row" href="#appointments" key={a.id}>
                <div>
                  <strong>{a.purpose}</strong>
                  <small>{new Date(a.startsAt).toLocaleString()}</small>
                </div>
                <span className="status">{a.status}</span>
              </a>
            ))}
            {appointments.data && !upcoming.length && (
              <p className="live-empty">
                No upcoming appointments on this page.
              </p>
            )}
          </div>
        </section>
      </div>
    </div>
  );
}

export function LiveProfile() {
  const { api, channel, user } = useAdminConnection()!;
  const profile = useLiveData<{ activeAdministrator: Profile | null }>(
    documents.administrator,
  );
  return (
    <>
      <ReadState loading={profile.loading} error={profile.error} />
      {profile.data?.activeAdministrator && (
        <>
          <section className="panel live-detail">
            <h2>
              {profile.data.activeAdministrator.firstName}{" "}
              {profile.data.activeAdministrator.lastName}
            </h2>
            <p>
              {user.identifier} ·{" "}
              {profile.data.activeAdministrator.emailAddress}
            </p>
            <h3>Authorized channels</h3>
            <ul>
              {user.channels.map((c) => (
                <li key={c.id}>{c.code}</li>
              ))}
            </ul>
          </section>
          <ActionForm
            key={profile.data.activeAdministrator.id}
            title="Update your profile"
            fields={[
              {
                name: "firstName",
                label: "First name",
                value: profile.data.activeAdministrator.firstName,
                required: true,
              },
              {
                name: "lastName",
                label: "Last name",
                value: profile.data.activeAdministrator.lastName,
                required: true,
              },
            ]}
            onSave={(v) =>
              mutate(api, channel.token, "updateActiveAdministrator", {
                input: v,
              })
            }
            onDone={profile.reload}
          />
          <p className="live-hint">
            Roles, passwords and account security settings remain in Vendure. No
            demo security indicators are shown here.
          </p>
        </>
      )}
    </>
  );
}
