import test from "node:test";
import assert from "node:assert/strict";
import { AdminApi } from "./admin-api.ts";
const user = {
  __typename: "CurrentUser",
  id: "staff-1",
  identifier: "test-admin",
  channels: [
    {
      id: "channel-1",
      code: "nelo-ng",
      token: "test-channel",
      permissions: ["ManageAtelierAppointments"],
    },
  ],
};
function mockTransport(responses: Response[]) {
  const calls: { url: string; options: RequestInit }[] = [];
  const transport: typeof fetch = async (url, options) => {
    calls.push({ url: String(url), options: options! });
    const response = responses.shift();
    if (!response) throw new Error("Unexpected extra request");
    return response;
  };
  return { calls, transport };
}
const result = (data: unknown, token?: string) =>
  new Response(JSON.stringify({ data }), {
    headers: token ? { "vendure-auth-token": token } : {},
  });
test("login captures bearer token; appointments send authorization and channel with no cookies", async () => {
  const mock = mockTransport([
    result({ login: user }, "test-session"),
    result({ atelierAppointments: { items: [], totalItems: 0 } }),
  ]);
  const api = new AdminApi("http://localhost:3000/admin-api", mock.transport);
  await api.login("test-admin", "test-password");
  await api.appointments("test-channel", 20, "requested");
  const call = mock.calls[1].options;
  assert.equal(call.credentials, "omit");
  assert.equal(call.cache, "no-store");
  assert.equal(
    new Headers(call.headers).get("Authorization"),
    "Bearer test-session",
  );
  assert.equal(new Headers(call.headers).get("vendure-token"), "test-channel");
  assert.deepEqual(JSON.parse(String(call.body)).variables.options, {
    skip: 20,
    take: 20,
    status: ["requested"],
  });
});
test("invalid login and missing token never establish a session", async () => {
  for (const response of [
    result({
      login: {
        __typename: "InvalidCredentialsError",
        message: "secret provider message",
      },
    }),
    result({ login: user }),
  ]) {
    const mock = mockTransport([response]);
    await assert.rejects(
      new AdminApi("https://backend.example/admin-api", mock.transport).login(
        "x",
        "y",
      ),
    );
  }
});
test("GraphQL partial errors are rejected and authorization failures are explained", async () => {
  const mock = mockTransport([
    new Response(
      JSON.stringify({
        data: { atelierAppointments: null },
        errors: [{ message: "Forbidden", extensions: { code: "FORBIDDEN" } }],
      }),
    ),
  ]);
  await assert.rejects(
    new AdminApi(
      "https://backend.example/admin-api",
      mock.transport,
    ).appointments("channel", 0),
    /permissions/,
  );
});
test("a failed update is issued once, without automatic retries", async () => {
  let calls = 0;
  const transport: typeof fetch = async () => {
    calls++;
    throw new Error("Disconnected after server write");
  };
  await assert.rejects(
    new AdminApi("https://backend.example/admin-api", transport).transition(
      "channel",
      "confirm",
      "opaque-id",
    ),
    /Cannot reach/,
  );
  assert.equal(calls, 1);
});
test("reschedule sends UTC time and the opaque id using the existing schema", async () => {
  const mock = mockTransport([
    result({ rescheduleAtelierAppointment: { id: "opaque-id" } }),
  ]);
  await new AdminApi(
    "https://backend.example/admin-api",
    mock.transport,
  ).transition(
    "channel",
    "reschedule",
    "opaque-id",
    "2026-12-01T09:00:00.000Z",
  );
  const body = JSON.parse(String(mock.calls[0].options.body));
  assert.match(body.query, /RescheduleAtelierAppointmentInput!/);
  assert.deepEqual(body.variables.input, {
    id: "opaque-id",
    startsAt: "2026-12-01T09:00:00.000Z",
  });
});
test("logout clears the local token even when backend invalidation fails", async () => {
  const mock = mockTransport([
    result({ login: user }, "test-session"),
    new Response("failure", { status: 503 }),
    result({ atelierAppointments: { items: [], totalItems: 0 } }),
  ]);
  const api = new AdminApi("https://backend.example/admin-api", mock.transport);
  await api.login("test-admin", "test-password");
  await assert.rejects(api.logout());
  await api.appointments("channel", 0);
  assert.equal(
    new Headers(mock.calls[2].options.headers).get("Authorization"),
    null,
  );
});
test("credentials and insecure remote endpoints are refused", () => {
  for (const url of [
    "http://backend.example/admin-api",
    "https://user:pass@backend.example/admin-api",
    "https://backend.example/admin-api?key=secret",
  ])
    assert.throws(() => new AdminApi(url));
});

test("browser fetch is called without binding it to the API instance", async () => {
  const transport: typeof fetch = async function (this: unknown) {
    assert.equal(this, undefined);
    return result({ atelierAppointments: { items: [], totalItems: 0 } });
  };
  await new AdminApi(
    "https://backend.example/admin-api",
    transport,
  ).appointments("channel", 0);
});

test("asset upload uses multipart GraphQL mapping, bearer channel and a preflight header", async () => {
  const mock = mockTransport([
    result({ login: user }, "test-session"),
    result({ createAssets: [{ id: "asset-opaque" }] }),
  ]);
  const api = new AdminApi("http://localhost:3000/admin-api", mock.transport);
  await api.login("test-admin", "test-password");
  const asset = await api.upload(
    "test-channel",
    new File(["test-image"], "test.png", { type: "image/png" }),
  );
  assert.equal(asset.id, "asset-opaque");
  const call = mock.calls[1].options;
  const headers = new Headers(call.headers);
  assert.equal(headers.get("Authorization"), "Bearer test-session");
  assert.equal(headers.get("vendure-token"), "test-channel");
  assert.equal(headers.get("Apollo-Require-Preflight"), "true");
  assert.equal(headers.has("Content-Type"), false);
  assert.equal(call.credentials, "omit");
  assert.ok(call.body instanceof FormData);
  assert.deepEqual(JSON.parse(String(call.body.get("map"))), {
    "0": ["variables.input.0.file"],
  });
  assert.equal(
    JSON.parse(String(call.body.get("operations"))).variables.input[0].file,
    null,
  );
});

test("a truncated success response is uncertain and is never retried", async () => {
  const mock = mockTransport([new Response('{"data":', { status: 200 })]);
  const api = new AdminApi("http://localhost:3000/admin-api", mock.transport);
  await assert.rejects(
    api.request(
      'mutation { updateActiveAdministrator(input: { firstName: "Test" }) { id } }',
    ),
    (e: unknown) => e instanceof Error && "code" in e && e.code === "UNCERTAIN",
  );
  assert.equal(mock.calls.length, 1);
});
